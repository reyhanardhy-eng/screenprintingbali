import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { portfolioStorageDir } from "@/lib/portfolio-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(filename)) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    const body = await readFile(join(portfolioStorageDir(), filename));
    const type = filename.endsWith(".jpg") ? "image/jpeg" : filename.endsWith(".png") ? "image/png" : "image/webp";
    return new NextResponse(body, {
      headers: {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
