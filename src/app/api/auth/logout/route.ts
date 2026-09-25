import { NextResponse, type NextRequest } from "next/server";
import { revokeCurrentSession } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  await revokeCurrentSession();
  return NextResponse.json({ ok: true });
}
