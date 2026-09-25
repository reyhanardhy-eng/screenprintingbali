import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { rows } from "@/lib/db";
import { assertSameOrigin, clientAddress, checkRateLimit } from "@/lib/security";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";
const generic = { ok: true, message: "If an account matches that address, a reset link will arrive shortly." };

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json(generic, { status: 202 }); }
  const parsed = z.object({ email: z.string().trim().email().max(254) }).safeParse(body);
  if (!parsed.success) return NextResponse.json(generic, { status: 202 });
  const email = parsed.data.email.toLowerCase();
  const ip = clientAddress(request);
  if (!(await checkRateLimit(`reset:ip:${ip}`, 8, 3600)) || !(await checkRateLimit(`reset:email:${email}`, 3, 3600))) {
    return NextResponse.json(generic, { status: 202 });
  }
  const users = await rows<RowDataPacket & { id: string }>(
    "SELECT id FROM users WHERE email = ? AND disabled_at IS NULL LIMIT 1", [email]
  );
  if (users[0]) {
    try {
      const token = await createAuthToken(users[0].id, "password_reset", 20);
      await sendPasswordResetEmail(email, token);
    } catch {
      // Keep the response identical whether the address exists or email is unavailable.
    }
  }
  return NextResponse.json(generic, { status: 202 });
}

