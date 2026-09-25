import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";
import type { NextRequest } from "next/server";
import { rows, run } from "./db";
import type { RowDataPacket } from "mysql2/promise";

export const SESSION_COOKIE = "__Host-spb_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(
  encoded: string | null,
  password: string
): Promise<boolean> {
  // Use a real Argon2 hash for missing or legacy accounts too, so login time
  // does not reveal whether an email address exists in the users table.
  const hash = encoded ?? (await dummyPasswordHash());
  try {
    const matched = await argon2.verify(hash, password);
    return Boolean(encoded) && matched;
  } catch {
    return false;
  }
}

let dummyHashPromise: Promise<string> | undefined;
function dummyPasswordHash(): Promise<string> {
  dummyHashPromise ??= hashPassword(randomToken());
  return dummyHashPromise;
}

export function publicAppUrl(path: string): string {
  const base = process.env.APP_BASE_URL;
  if (!base) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("APP_BASE_URL must be set in production.");
    }
    return new URL(path, "http://localhost:3000").toString();
  }
  const url = new URL(base);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("APP_BASE_URL must use HTTPS in production.");
  }
  return new URL(path, url).toString();
}

export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  const trustedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !trustedHost) throw new Error("Request origin is required.");

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error("Invalid request origin.");
  }

  if (parsed.host.toLowerCase() !== trustedHost.split(",")[0].trim().toLowerCase()) {
    throw new Error("Cross-origin request rejected.");
  }
  if (
    process.env.NODE_ENV === "production" &&
    parsed.protocol !== "https:"
  ) {
    throw new Error("HTTPS is required.");
  }
}

export function clientAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate = forwarded?.split(",")[0]?.trim();
  return candidate || request.headers.get("x-real-ip") || "unknown";
}

export async function checkRateLimit(
  key: string,
  maximum: number,
  windowSeconds: number
): Promise<boolean> {
  const keyHash = sha256(key);
  const now = Math.floor(Date.now() / 1000);
  const result = await run(
    `INSERT INTO rate_limits (bucket_hash, hits, window_started_at)
     VALUES (?, 1, ?)
     ON DUPLICATE KEY UPDATE
       hits = IF(window_started_at <= ?, 1, hits + 1),
       window_started_at = IF(window_started_at <= ?, VALUES(window_started_at), window_started_at)`,
    [keyHash, now, now - windowSeconds, now - windowSeconds]
  );
  const count = await rows<{ hits: number } & RowDataPacket>(
    "SELECT hits FROM rate_limits WHERE bucket_hash = ?",
    [keyHash]
  );
  return Boolean(result.affectedRows) && (count[0]?.hits ?? 0) <= maximum;
}
