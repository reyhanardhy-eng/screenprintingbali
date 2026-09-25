import { NextResponse } from "next/server";
import { getPrincipal } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getPrincipal();
  return NextResponse.json(
    { user: user ? { id: user.id, email: user.email, full_name: user.full_name, role: user.role } : null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
