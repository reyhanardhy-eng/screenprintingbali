import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { adminApiResponse } from "@/lib/admin-api";
import { assertSameOrigin, checkRateLimit } from "@/lib/security";
import { ensurePortfolioStorage } from "@/lib/portfolio-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function extension(bytes: Buffer): "jpg" | "png" | "webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  const { user, response } = await adminApiResponse();
  if (response || !user) return response;
  if (!(await checkRateLimit(`portfolio-upload:${user.id}`, 20, 60))) {
    return NextResponse.json({ error: "Too many uploads. Try again shortly." }, { status: 429 });
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_IMAGE_BYTES + 100_000) {
    return NextResponse.json({ error: "Image is too large." }, { status: 413 });
  }
  let form: FormData;
  try { form = await request.formData(); } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image must be at most 5 MB." }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extension(bytes);
  if (!ext) return NextResponse.json({ error: "Only JPG, PNG, and WebP images are supported." }, { status: 415 });
  try {
    const name = `${randomUUID()}.${ext}`;
    const directory = await ensurePortfolioStorage();
    await writeFile(join(directory, name), bytes, { flag: "wx", mode: 0o640 });
    return NextResponse.json({ image_url: `/api/media/${name}` });
  } catch {
    return NextResponse.json({ error: "Could not store image." }, { status: 500 });
  }
}
