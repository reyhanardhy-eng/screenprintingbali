import "server-only";
import { NextResponse } from "next/server";
import { getPrincipal } from "./auth";

export async function adminApiResponse() {
  const user = await getPrincipal();
  if (!user) return { user: null, response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (user.role !== "admin" || !user.totp_enabled || user.auth_level !== "full") {
    return { user: null, response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { user, response: null };
}
