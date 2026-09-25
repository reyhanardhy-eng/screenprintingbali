import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { getPrincipal, issueSession } from "@/lib/auth";
import { getDb, run } from "@/lib/db";
import { createRecoveryCodes, createTotp, decryptTotpSecret, encryptTotpSecret, verifyTotp } from "@/lib/mfa";
import { assertSameOrigin, sha256 } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const pending = await getPrincipal(true);
  if (!pending || pending.role !== "admin" || pending.auth_level !== "mfa_enrollment" || pending.totp_enabled) {
    return NextResponse.json({ error: "MFA enrollment is not available." }, { status: 403 });
  }
  try {
    let secret: string;
    if (pending.totp_pending_enc) {
      secret = decryptTotpSecret(pending.totp_pending_enc);
    } else {
      secret = createTotp(pending.email).secret.base32;
      await run("UPDATE users SET totp_pending_enc = ? WHERE id = ? AND totp_enabled = 0", [encryptTotpSecret(secret), pending.id]);
    }
    const totp = createTotp(pending.email, secret);
    const qr = await QRCode.toDataURL(totp.toString(), { errorCorrectionLevel: "M", margin: 2, width: 240 });
    return NextResponse.json({ qr, secret }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not start authenticator setup." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  const pending = await getPrincipal(true);
  if (!pending || pending.role !== "admin" || pending.auth_level !== "mfa_enrollment" || pending.totp_enabled || !pending.totp_pending_enc) {
    return NextResponse.json({ error: "MFA enrollment session expired." }, { status: 401 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid code." }, { status: 400 }); }
  const parsed = z.object({ code: z.string().trim().regex(/^\d{6}$/) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter the six-digit code from your authenticator." }, { status: 400 });
  let valid = false;
  try {
    valid = verifyTotp(pending.email, decryptTotpSecret(pending.totp_pending_enc), parsed.data.code);
  } catch {
    return NextResponse.json({ error: "Authenticator is not configured correctly." }, { status: 503 });
  }
  if (!valid) return NextResponse.json({ error: "That code did not match. Try the latest code." }, { status: 400 });

  const codes = createRecoveryCodes();
  const db = getDb();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [update] = await connection.execute(
      "UPDATE users SET totp_secret_enc = totp_pending_enc, totp_pending_enc = NULL, totp_enabled = 1 WHERE id = ? AND totp_enabled = 0",
      [pending.id]
    );
    const affected = (update as { affectedRows: number }).affectedRows;
    if (affected !== 1) throw new Error("MFA already configured.");
    for (const code of codes) {
      await connection.execute(
        "INSERT INTO totp_recovery_codes (user_id, code_hash) VALUES (?, ?)",
        [pending.id, sha256(code)]
      );
    }
    await connection.execute("DELETE FROM sessions WHERE id = ?", [pending.session_id]);
    await connection.execute(
      "INSERT INTO audit_log (actor_id, action, target_type, target_id) VALUES (?, 'admin.mfa_enabled', 'user', ?)",
      [pending.id, pending.id]
    );
    await connection.commit();
  } catch {
    await connection.rollback();
    return NextResponse.json({ error: "Could not enable MFA." }, { status: 500 });
  } finally {
    connection.release();
  }
  await issueSession(pending.id, "full");
  return NextResponse.json({ ok: true, recovery_codes: codes });
}
