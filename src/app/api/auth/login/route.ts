import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { issueSession } from "@/lib/auth";
import { rows, run } from "@/lib/db";
import { assertSameOrigin, clientAddress, checkRateLimit, verifyPassword, sha256 } from "@/lib/security";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";
const schema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) }).strict();
type UserRow = RowDataPacket & { id: string; email: string; password_hash: string | null; role: "admin"; email_verified_at: Date | null; disabled_at: Date | null; totp_enabled: number };

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });

  const email = parsed.data.email.toLowerCase();
  const ip = clientAddress(request);
  if (!(await checkRateLimit(`login:ip:${ip}`, 20, 900)) || !(await checkRateLimit(`login:email:${email}`, 10, 900))) {
    return NextResponse.json({ error: "Too many attempts. Wait a few minutes and try again." }, { status: 429 });
  }

  const matches = await rows<UserRow>(
    "SELECT id, email, password_hash, role, email_verified_at, disabled_at, totp_enabled FROM users WHERE email = ? AND role = 'admin' LIMIT 1",
    [email]
  );
  const user = matches[0];
  const passwordMatches = await verifyPassword(user?.password_hash ?? null, parsed.data.password);
  if (!user || !passwordMatches || user.disabled_at || !user.email_verified_at) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const isEnrolled = user.totp_enabled;
  await issueSession(user.id, isEnrolled ? "mfa_challenge" : "mfa_enrollment");
  await run(
    "INSERT INTO audit_log (actor_id, action, target_type, target_id, ip_hash) VALUES (?, 'admin.login_password', 'user', ?, ?)",
    [user.id, user.id, sha256(ip)]
  );
  return NextResponse.json({ ok: true, stage: isEnrolled ? "mfa" : "mfa_setup" });
}
