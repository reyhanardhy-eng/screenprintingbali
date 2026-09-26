import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { adminApiResponse } from "@/lib/admin-api";
import { run } from "@/lib/db";
import {
  deleteAdminLivechatConversation,
  getAdminLivechatConversations,
  getAdminLivechatMessages,
  saveAdminLivechatReply,
  setLivechatHumanMode,
} from "@/lib/livechat-history";
import { assertSameOrigin, checkRateLimit, clientAddress, sha256 } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const actionSchema = z.object({
  action: z.enum(["reply", "takeover", "resume_ai"]),
  sessionId: z.string().uuid(),
  message: z.string().trim().min(1).max(2000).optional(),
}).strict().superRefine((value, context) => {
  if (value.action === "reply" && !value.message) {
    context.addIssue({ code: "custom", path: ["message"], message: "A reply is required." });
  }
});

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

const deleteSchema = z.object({ sessionId: z.string().uuid() }).strict();

export async function GET(request: NextRequest) {
  const { user, response } = await adminApiResponse();
  if (response || !user) return response;

  try {
    if (!(await checkRateLimit(`admin-chat-read:${user.id}`, 180, 60))) {
      return responseError("Too many refreshes. Please wait a moment.", 429);
    }
    const conversations = await getAdminLivechatConversations();
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ conversations }, { headers: { "Cache-Control": "private, no-store" } });
    }
    if (!z.string().uuid().safeParse(sessionId).success) return responseError("Invalid conversation.", 400);
    const conversation = conversations.find((item) => item.id === sessionId);
    if (!conversation) return responseError("Conversation not found or expired.", 404);
    const messages = await getAdminLivechatMessages(sessionId);
    return NextResponse.json({ conversation, messages }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return responseError("Chat inbox could not be loaded. Check the database connection.", 503);
  }
}

export async function DELETE(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return responseError("Request rejected.", 403);
  }

  const { user, response } = await adminApiResponse();
  if (response || !user) return response;

  let body: unknown;
  try { body = await request.json(); } catch {
    return responseError("Invalid conversation.", 400);
  }
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return responseError("Invalid conversation.", 400);

  try {
    if (!(await checkRateLimit(`admin-chat-write:${user.id}`, 40, 60))) {
      return responseError("Too many changes. Please wait a moment.", 429);
    }
    const deleted = await deleteAdminLivechatConversation(
      parsed.data.sessionId,
      user.id,
      sha256(clientAddress(request)).slice(0, 64)
    );
    if (!deleted) return responseError("This conversation was already removed or expired.", 404);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return responseError("The conversation could not be deleted. Please try again.", 503);
  }
}

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return responseError("Request rejected.", 403);
  }

  const { user, response } = await adminApiResponse();
  if (response || !user) return response;

  let body: unknown;
  try { body = await request.json(); } catch {
    return responseError("Invalid chat action.", 400);
  }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return responseError("Check the message and try again.", 400);

  try {
    if (!(await checkRateLimit(`admin-chat-write:${user.id}`, 40, 60))) {
      return responseError("Too many replies. Please wait a moment.", 429);
    }
    const { action, sessionId, message } = parsed.data;
    if (action === "reply") {
      await saveAdminLivechatReply(sessionId, message!);
    } else {
      await setLivechatHumanMode(sessionId, action === "takeover");
    }
    const ipHash = sha256(clientAddress(request)).slice(0, 64);
    await run(
      "INSERT INTO audit_log (actor_id, action, target_type, target_id, ip_hash) VALUES (?, ?, 'ai_chat_session', ?, ?)",
      [user.id, action === "reply" ? "chat.reply" : action === "takeover" ? "chat.takeover" : "chat.resume_ai", sessionId, ipHash]
    );
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return responseError("Your reply could not be sent. The conversation may have expired.", 503);
  }
}
