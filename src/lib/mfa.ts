import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import * as OTPAuth from "otpauth";

function encryptionKey(): Buffer {
  const encoded = process.env.MFA_ENCRYPTION_KEY;
  if (!encoded) throw new Error("MFA_ENCRYPTION_KEY is required.");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("MFA_ENCRYPTION_KEY must be 32 bytes in base64.");
  return key;
}

export function encryptTotpSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url")).join(".");
}

export function decryptTotpSecret(encoded: string): string {
  const [ivPart, tagPart, bodyPart] = encoded.split(".");
  if (!ivPart || !tagPart || !bodyPart) throw new Error("Invalid encrypted TOTP secret.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivPart, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(bodyPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function createTotp(email: string, secret?: string): OTPAuth.TOTP {
  const totpSecret = secret
    ? OTPAuth.Secret.fromBase32(secret)
    : new OTPAuth.Secret();
  return new OTPAuth.TOTP({
    issuer: "Screenprinting Bali",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: totpSecret,
  });
}

export function verifyTotp(email: string, secret: string, token: string): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  return createTotp(email, secret).validate({ token, window: 1 }) !== null;
}

export function createRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => randomBytes(6).toString("base64url").toUpperCase());
}

