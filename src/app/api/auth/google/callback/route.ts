import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import type { RowDataPacket } from "mysql2/promise";
import { issueSession } from "@/lib/auth";
import { rows, run } from "@/lib/db";
import { publicAppUrl, safeEqual } from "@/lib/security";

const cookieNames = ["spb_oauth_state", "spb_oauth_nonce", "spb_oauth_verifier"] as const;
const cookieName = (name: string) => process.env.NODE_ENV === "production" ? `__Host-${name}` : name;
const errorRedirect = () => NextResponse.redirect(publicAppUrl("/?chat_error=google_signin#chat"));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || "";
  const receivedState = searchParams.get("state") || "";
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(cookieName(cookieNames[0]))?.value || "";
  const nonce = cookieStore.get(cookieName(cookieNames[1]))?.value || "";
  const verifier = cookieStore.get(cookieName(cookieNames[2]))?.value || "";
  for (const name of cookieNames) cookieStore.delete(cookieName(name));
  if (!code || !receivedState || !expectedState || !safeEqual(receivedState, expectedState) || !nonce || !verifier) return errorRedirect();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return errorRedirect();
  try {
    const client = new OAuth2Client(clientId, clientSecret, publicAppUrl("/api/auth/google/callback"));
    const { tokens } = await client.getToken({ code, codeVerifier: verifier });
    if (!tokens.id_token) return errorRedirect();
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true || payload.nonce !== nonce) return errorRedirect();

    const existingGoogle = await rows<RowDataPacket & { user_id: string }>(
      "SELECT user_id FROM oauth_accounts WHERE provider = 'google' AND provider_account_id = ? LIMIT 1",
      [payload.sub]
    );
    let userId = existingGoogle[0]?.user_id;
    let userRole: string | undefined;
    if (userId) {
      const byId = await rows<RowDataPacket & { role: string; disabled_at: Date | null }>(
        "SELECT role, disabled_at FROM users WHERE id = ? LIMIT 1", [userId]
      );
      userRole = byId[0]?.role;
      if (!byId[0] || byId[0].disabled_at) return errorRedirect();
    } else {
      const email = payload.email.toLowerCase();
      const byEmail = await rows<RowDataPacket & { id: string; role: string; disabled_at: Date | null }>(
        "SELECT id, role, disabled_at FROM users WHERE email = ? LIMIT 1", [email]
      );
      if (byEmail[0]) {
        if (byEmail[0].role === "admin" || byEmail[0].disabled_at) return errorRedirect();
        userId = byEmail[0].id;
        userRole = byEmail[0].role;
        await run("UPDATE users SET email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP()) WHERE id = ?", [userId]);
      } else {
        userId = randomUUID();
        userRole = "customer";
        await run(
          `INSERT INTO users (id, email, full_name, password_hash, role, email_verified_at, created_at)
           VALUES (?, ?, ?, NULL, 'customer', UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
          [userId, email, payload.name?.slice(0, 160) || null]
        );
      }
      await run(
        "INSERT INTO oauth_accounts (provider, provider_account_id, user_id) VALUES ('google', ?, ?) ON DUPLICATE KEY UPDATE provider_account_id = VALUES(provider_account_id)",
        [payload.sub, userId]
      );
    }
    if (userRole !== "customer") return errorRedirect();
    await issueSession(userId!, "full");
    return NextResponse.redirect(publicAppUrl("/?chat=ready#chat"));
  } catch {
    return errorRedirect();
  }
}
