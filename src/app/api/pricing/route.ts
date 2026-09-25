import { NextResponse } from "next/server";
import { fetchPricingData } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await fetchPricingData(), {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json({ error: "Pricing is temporarily unavailable." }, { status: 503 });
  }
}
