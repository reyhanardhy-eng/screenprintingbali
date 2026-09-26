import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { getPrincipal, issueSession } from "@/lib/auth";
import { rows, run } from "@/lib/db";
import { decryptTotpSecret, verifyTotp } from "@/lib/mfa";
import { assertSameOrigin, checkRateLimit, sha256 } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  const pending = await getPrincipal(true);
  if (!pending || pending.role !== "admin" || pending.auth_level !== "mfa_challenge" || !pending.totp_secret_enc) {
    return NextResponse.json({ error: "Sign-in challenge expired." }, { status: 401 });
  }
  if (!(await checkRateLimit(`mfa:${pending.id}`, 8, 600))) {
    return NextResponse.json({ error: "Too many codes. Sign in again later." }, { status: 429 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid code." }, { status: 400 }); }
  const parsed = z.object({ code: z.string().trim().min(6).max(24) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid code." }, { status: 400 });

  let verified = false;
  try {
    verified = verifyTotp(pending.email, decryptTotpSecret(pending.totp_secret_enc), parsed.data.code);
  } catch {
    return NextResponse.json({ error: "Authenticator is not configured correctly." }, { status: 503 });
  }

  if (!verified) {
    const codeHash = sha256(parsed.data.code.toUpperCase().replace(/\s/g, ""));
    const recovery = await rows<RowDataPacket & { id: number }>(
      "SELECT id FROM totp_recovery_codes WHERE user_id = ? AND code_hash = ? AND used_at IS NULL LIMIT 1",
      [pending.id, codeHash]
    );
    if (recovery[0]) {
      const result = await run(
        "UPDATE totp_recovery_codes SET used_at = UTC_TIMESTAMP() WHERE id = ? AND used_at IS NULL",
        [recovery[0].id]
      );
      verified = result.affectedRows === 1;
    }
  }
  if (!verified) return NextResponse.json({ error: "Invalid code." }, { status: 401 });

  const consumed = await run("DELETE FROM sessions WHERE id = ? AND user_id = ? AND auth_level = 'mfa_challenge'", [
    pending.session_id,
    pending.id,
  ]);
  if (consumed.affectedRows !== 1) {
    return NextResponse.json({ error: "Sign-in challenge expired." }, { status: 401 });
  }
  await issueSession(pending.id, "full");
  return NextResponse.json({ ok: true });
}

