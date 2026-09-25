import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/mailer";
import { run } from "@/lib/db";
import { assertSameOrigin, clientAddress, checkRateLimit, hashPassword, sha256 } from "@/lib/security";

export const dynamic = "force-dynamic";
const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  full_name: z.string().trim().min(1).max(160).optional(),
}).strict();

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and a password with at least 12 characters." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const ip = clientAddress(request);
  if (!(await checkRateLimit(`signup:ip:${ip}`, 10, 3600)) || !(await checkRateLimit(`signup:email:${email}`, 3, 3600))) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const id = randomUUID();
  try {
    await run(
      "INSERT INTO users (id, email, full_name, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'customer', UTC_TIMESTAMP())",
      [id, email, parsed.data.full_name || null, await hashPassword(parsed.data.password)]
    );
  } catch {
    // Keep the response the same for existing addresses to reduce account enumeration.
    return NextResponse.json({ ok: true, message: "If this address can be registered, a verification email will arrive shortly." }, { status: 202 });
  }

  try {
    const token = await createAuthToken(id, "email_verification", 30);
    await sendVerificationEmail(email, token);
  } catch {
    await run("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ error: "Email verification is temporarily unavailable." }, { status: 503 });
  }
  await run(
    "INSERT INTO audit_log (actor_id, action, target_type, target_id, ip_hash) VALUES (?, 'account.signup', 'user', ?, ?)",
    [id, id, sha256(ip)]
  );
  return NextResponse.json({ ok: true, message: "Check your email to verify your account." }, { status: 202 });
}
