import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2/promise";
import type { AppRole, PublicUser } from "./auth-types";
import { rows, run } from "./db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  randomToken,
  sha256,
} from "./security";

export type AuthLevel = "full" | "mfa_challenge" | "mfa_enrollment";

type SessionRow = RowDataPacket & {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  auth_level: AuthLevel;
  totp_enabled: number;
  totp_secret_enc: string | null;
  totp_pending_enc: string | null;
};

export type Principal = PublicUser & {
  auth_level: AuthLevel;
  totp_enabled: boolean;
  totp_secret_enc: string | null;
  totp_pending_enc: string | null;
  session_id: string;
};

export function sessionCookieName(): string {
  return process.env.NODE_ENV === "production" ? SESSION_COOKIE : "spb_session";
}

export async function issueSession(
  userId: string,
  authLevel: AuthLevel = "full"
): Promise<void> {
  const token = randomToken();
  const id = randomUUID();
  const pending = authLevel !== "full";
  const maxAge = pending ? 10 * 60 : SESSION_MAX_AGE_SECONDS;
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await run(
    `INSERT INTO sessions (id, user_id, token_hash, auth_level, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
    [id, userId, sha256(token), authLevel, expiresAt]
  );

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
    expires: expiresAt,
  });
}

export async function getPrincipal(includePending = false): Promise<Principal | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  if (!token) return null;

  const found = await rows<SessionRow>(
    `SELECT s.id, s.user_id, s.auth_level, u.email, u.full_name, u.role,
            u.totp_enabled, u.totp_secret_enc, u.totp_pending_enc
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
       AND u.disabled_at IS NULL
     LIMIT 1`,
    [sha256(token)]
  );
  const session = found[0];
  if (!session) return null;

  if (!includePending && session.auth_level !== "full") return null;

  return {
    id: session.user_id,
    email: session.email,
    full_name: session.full_name,
    role: session.role,
    auth_level: session.auth_level,
    totp_enabled: Boolean(session.totp_enabled),
    totp_secret_enc: session.totp_secret_enc,
    totp_pending_enc: session.totp_pending_enc,
    session_id: session.id,
  };
}

export async function requireAdmin(): Promise<Principal> {
  const user = await getPrincipal();
  if (!user || user.role !== "admin") redirect("/admin/login");
  if (!user.totp_enabled) redirect("/admin/security/mfa");
  return user;
}

export async function requireMfaSetup(): Promise<Principal> {
  const user = await getPrincipal(true);
  if (!user || user.role !== "admin" || user.auth_level !== "mfa_enrollment") {
    redirect("/admin/login");
  }
  return user;
}

export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const name = sessionCookieName();
  const token = cookieStore.get(name)?.value;
  if (token) await run("DELETE FROM sessions WHERE token_hash = ?", [sha256(token)]);
  cookieStore.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await run("DELETE FROM sessions WHERE user_id = ?", [userId]);
}

