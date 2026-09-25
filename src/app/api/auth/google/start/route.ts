import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";
import { publicAppUrl } from "@/lib/security";

const cookieNames = ["spb_oauth_state", "spb_oauth_nonce", "spb_oauth_verifier"] as const;
const cookieName = (name: string) => process.env.NODE_ENV === "production" ? `__Host-${name}` : name;

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.redirect(publicAppUrl("/?chat_error=google_not_configured#chat"));

  const state = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const client = new OAuth2Client(clientId, clientSecret, publicAppUrl("/api/auth/google/callback"));
  const url = client.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: CodeChallengeMethod.S256,
    access_type: "online",
  });
  const cookieStore = await cookies();
  for (const [name, value] of [[cookieNames[0], state], [cookieNames[1], nonce], [cookieNames[2], verifier]] as const) {
    cookieStore.set(cookieName(name), value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  }
  return NextResponse.redirect(url);
}
