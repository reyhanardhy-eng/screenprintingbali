import { NextResponse } from "next/server";
import { consumeAuthToken } from "@/lib/auth-tokens";
import { rows, run } from "@/lib/db";
import { publicAppUrl } from "@/lib/security";
import type { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";
  const userId = token.length <= 128 ? await consumeAuthToken(token, "email_verification") : null;
  if (!userId) return NextResponse.redirect(publicAppUrl("/auth/verify-email?status=invalid"));
  await run("UPDATE users SET email_verified_at = UTC_TIMESTAMP() WHERE id = ? AND email_verified_at IS NULL", [userId]);
  const user = await rows<RowDataPacket & { role: string }>("SELECT role FROM users WHERE id = ? LIMIT 1", [userId]);
  return NextResponse.redirect(publicAppUrl(user[0]?.role === "admin" ? "/admin/login?verified=1" : "/auth/verify-email?status=success"));
}
