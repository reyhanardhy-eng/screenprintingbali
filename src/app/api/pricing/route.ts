import { NextResponse } from "next/server";
import { fetchPricingData } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await fetchPricingData(), {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    const details = error && typeof error === "object"
      ? error as { name?: unknown; code?: unknown; message?: unknown }
      : null;
    const message = typeof details?.message === "string"
      ? details.message
          .replace(/\b(password|passwd|pwd)\s*[:=]\s*\S+/gi, "$1=[redacted]")
          .replace(/mysql:\/\/[^/@\s]+@/gi, "mysql://[redacted]@")
          .slice(0, 300)
      : "Unknown error";
    console.error("[api/pricing] Failed to read pricing data", {
      name: typeof details?.name === "string" ? details.name : "UnknownError",
      code: typeof details?.code === "string" ? details.code : "UNKNOWN",
      message,
    });
    return NextResponse.json({ error: "Pricing is temporarily unavailable." }, { status: 503 });
  }
}
