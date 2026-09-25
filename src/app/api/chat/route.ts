import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { getPrincipal } from "@/lib/auth";
import { rows, run } from "@/lib/db";
import { assertSameOrigin, checkRateLimit } from "@/lib/security";
import type { ChatMessage, Conversation } from "@/lib/chat";

export const dynamic = "force-dynamic";

type ConversationRow = RowDataPacket & Conversation & { unread_count?: number };
type MessageRow = RowDataPacket & ChatMessage;

export async function GET(request: NextRequest) {
  const user = await getPrincipal();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const requestedId = request.nextUrl.searchParams.get("conversationId");
  if (user.role === "admin") {
    if (!user.totp_enabled) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    if (!requestedId) {
      const conversations = await rows<ConversationRow>(
        `SELECT c.id, c.visitor_id, c.visitor_email, c.status, c.created_at, c.last_message_at,
                (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.read_by_admin = 0) AS unread_count
         FROM conversations c ORDER BY (unread_count > 0) DESC, c.last_message_at DESC LIMIT 200`
      );
      return NextResponse.json({ conversations }, { headers: { "Cache-Control": "private, no-store" } });
    }
    const owned = await rows<RowDataPacket & { id: string }>("SELECT id FROM conversations WHERE id = ? LIMIT 1", [requestedId]);
    if (!owned[0]) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    const messages = await rows<MessageRow>(
      "SELECT id, conversation_id, sender, sender_id, body, read_by_admin, read_by_visitor, created_at FROM messages WHERE conversation_id = ? ORDER BY id LIMIT 500",
      [requestedId]
    );
    return NextResponse.json({ messages }, { headers: { "Cache-Control": "private, no-store" } });
  }

  const conversation = await rows<ConversationRow>(
    "SELECT id, visitor_id, visitor_email, status, created_at, last_message_at FROM conversations WHERE visitor_id = ? LIMIT 1",
    [user.id]
  );
  if (!conversation[0]) return NextResponse.json({ conversation: null, messages: [] });
  if (requestedId && requestedId !== conversation[0].id) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }
  const messages = await rows<MessageRow>(
    "SELECT id, conversation_id, sender, sender_id, body, read_by_admin, read_by_visitor, created_at FROM messages WHERE conversation_id = ? ORDER BY id LIMIT 500",
    [conversation[0].id]
  );
  return NextResponse.json({ conversation: conversation[0], messages }, { headers: { "Cache-Control": "private, no-store" } });
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }).strict(),
  z.object({ action: z.literal("send"), conversationId: z.string().uuid(), body: z.string().trim().min(1).max(4000) }).strict(),
  z.object({ action: z.literal("read"), conversationId: z.string().uuid() }).strict(),
  z.object({ action: z.literal("close"), conversationId: z.string().uuid() }).strict(),
]);

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  const user = await getPrincipal();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Chat request did not pass validation." }, { status: 400 });
  if (parsed.data.action === "close" && user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  if (user.role === "admin" && !user.totp_enabled) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  if (!(await checkRateLimit(`chat:${user.id}`, user.role === "admin" ? 120 : 30, 60))) {
    return NextResponse.json({ error: "Too many messages. Wait a moment and try again." }, { status: 429 });
  }

  if (parsed.data.action === "start") {
    if (user.role !== "customer") return NextResponse.json({ error: "Only customer accounts start chats." }, { status: 403 });
    const id = randomUUID();
    await run(
      `INSERT INTO conversations (id, visitor_id, visitor_email, status, created_at, last_message_at)
       VALUES (?, ?, ?, 'open', UTC_TIMESTAMP(), UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE visitor_email = VALUES(visitor_email)`,
      [id, user.id, user.email]
    );
    const conversation = await rows<RowDataPacket & { id: string }>("SELECT id FROM conversations WHERE visitor_id = ? LIMIT 1", [user.id]);
    return NextResponse.json({ conversationId: conversation[0]?.id }, { status: 201 });
  }

  const { conversationId } = parsed.data;
  const owned = await rows<RowDataPacket & { id: string; visitor_id: string }>(
    "SELECT id, visitor_id FROM conversations WHERE id = ? LIMIT 1", [conversationId]
  );
  const conversation = owned[0];
  if (!conversation || (user.role !== "admin" && conversation.visitor_id !== user.id)) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  if (parsed.data.action === "send") {
    const bodyText = parsed.data.body.trim();
    const result = await run(
      `INSERT INTO messages (conversation_id, sender, sender_id, body, read_by_admin, read_by_visitor, created_at)
       VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [conversationId, user.role === "admin" ? "admin" : "visitor", user.id, bodyText, user.role === "admin" ? 1 : 0, user.role === "admin" ? 0 : 1]
    );
    await run("UPDATE conversations SET last_message_at = UTC_TIMESTAMP(), status = 'open' WHERE id = ?", [conversationId]);
    const message = await rows<MessageRow>(
      "SELECT id, conversation_id, sender, sender_id, body, read_by_admin, read_by_visitor, created_at FROM messages WHERE id = ? LIMIT 1",
      [result.insertId]
    );
    return NextResponse.json({ message: message[0] }, { status: 201 });
  }

  if (parsed.data.action === "read") {
    const column = user.role === "admin" ? "read_by_admin" : "read_by_visitor";
    await run(`UPDATE messages SET ${column} = 1 WHERE conversation_id = ? AND ${column} = 0`, [conversationId]);
    return NextResponse.json({ ok: true });
  }

  await run("UPDATE conversations SET status = 'closed' WHERE id = ?", [conversationId]);
  await run(
    "INSERT INTO audit_log (actor_id, action, target_type, target_id) VALUES (?, 'chat.close', 'conversation', ?)",
    [user.id, conversationId]
  );
  return NextResponse.json({ ok: true });
}
