import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { assertSameOrigin, hashPassword, sha256 } from "@/lib/security";

export const dynamic = "force-dynamic";
const schema = z.object({ token: z.string().min(32).max(128), password: z.string().min(12).max(128) }).strict();

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Use a password with at least 12 characters." }, { status: 400 });
  const pool = getDb();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const tokenHash = sha256(parsed.data.token);
    const [found] = await connection.execute(
      `SELECT auth_tokens.id, auth_tokens.user_id FROM auth_tokens
       INNER JOIN users ON users.id = auth_tokens.user_id AND users.role = 'admin' AND users.disabled_at IS NULL
       WHERE auth_tokens.token_hash = ? AND auth_tokens.purpose = 'password_reset' AND auth_tokens.consumed_at IS NULL
         AND auth_tokens.expires_at > UTC_TIMESTAMP() LIMIT 1 FOR UPDATE`,
      [tokenHash]
    );
    const tokenRows = found as Array<{ id: string; user_id: string }>;
    if (!tokenRows[0]) {
      await connection.rollback();
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }
    await connection.execute("UPDATE auth_tokens SET consumed_at = UTC_TIMESTAMP() WHERE id = ?", [tokenRows[0].id]);
    await connection.execute(
      "UPDATE users SET password_hash = ? WHERE id = ? AND role = 'admin' AND disabled_at IS NULL",
      [await hashPassword(parsed.data.password), tokenRows[0].user_id]
    );
    await connection.execute("DELETE FROM sessions WHERE user_id = ?", [tokenRows[0].user_id]);
    await connection.execute(
      "INSERT INTO audit_log (actor_id, action, target_type, target_id) VALUES (?, 'account.password_reset', 'user', ?)",
      [tokenRows[0].user_id, tokenRows[0].user_id]
    );
    await connection.commit();
    return NextResponse.json({ ok: true });
  } catch {
    await connection.rollback();
    return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  } finally {
    connection.release();
  }
}
