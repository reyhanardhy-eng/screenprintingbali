import "server-only";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { rows, run } from "./db";
import { randomToken, sha256 } from "./security";

export type AuthTokenPurpose = "email_verification" | "password_reset";

export async function createAuthToken(
  userId: string,
  purpose: AuthTokenPurpose,
  lifetimeMinutes: number
): Promise<string> {
  const token = randomToken();
  await run(
    `INSERT INTO auth_tokens (id, user_id, purpose, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE), UTC_TIMESTAMP())`,
    [randomUUID(), userId, purpose, sha256(token), lifetimeMinutes]
  );
  return token;
}

export async function consumeAuthToken(
  token: string,
  purpose: AuthTokenPurpose
): Promise<string | null> {
  const matches = await rows<RowDataPacket & { id: string; user_id: string }>(
    `SELECT id, user_id FROM auth_tokens
     WHERE token_hash = ? AND purpose = ? AND consumed_at IS NULL
       AND expires_at > UTC_TIMESTAMP() LIMIT 1`,
    [sha256(token), purpose]
  );
  const match = matches[0];
  if (!match) return null;
  const result = await run(
    `UPDATE auth_tokens SET consumed_at = UTC_TIMESTAMP()
     WHERE id = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP()`,
    [match.id]
  );
  return result.affectedRows === 1 ? match.user_id : null;
}

