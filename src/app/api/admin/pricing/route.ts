import { NextResponse } from "next/server";
import { fetchPricingData } from "@/lib/pricing";
import { getPrincipal } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getPrincipal();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (user.role !== "admin" || !user.totp_enabled) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  try {
    return NextResponse.json(await fetchPricingData(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Pricing is temporarily unavailable." }, { status: 503 });
  }
}
