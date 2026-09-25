import "server-only";
import { randomUUID } from "node:crypto";
import { run } from "./db";
import { randomToken, sha256 } from "./security";

export type AuthTokenPurpose = "password_reset";

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

