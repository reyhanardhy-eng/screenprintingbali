import "server-only";
import nodemailer from "nodemailer";
import { publicAppUrl } from "./security";

function transport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !user || !password) {
    throw new Error("Hostinger SMTP is not configured.");
  }
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user, pass: password },
  });
}

function fromAddress(): string {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("MAIL_FROM is not configured.");
  return from;
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = publicAppUrl(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
  await transport().sendMail({
    from: fromAddress(),
    to: email,
    subject: "Verify your Screenprinting Bali account",
    text: `Verify your email by opening this one-time link: ${link}\nThis link expires in 30 minutes.`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = publicAppUrl(`/auth/reset-password?token=${encodeURIComponent(token)}`);
  await transport().sendMail({
    from: fromAddress(),
    to: email,
    subject: "Reset your Screenprinting Bali password",
    text: `Reset your password using this one-time link: ${link}\nThis link expires in 20 minutes. If you did not request this, ignore this email.`,
  });
}
