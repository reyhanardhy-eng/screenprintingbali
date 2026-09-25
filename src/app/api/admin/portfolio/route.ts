import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminApiResponse } from "@/lib/admin-api";
import { rows, run } from "@/lib/db";
import { assertSameOrigin, clientAddress, checkRateLimit, sha256 } from "@/lib/security";
import { deletePortfolioImage } from "@/lib/portfolio-storage";
import type { PortfolioItem } from "@/lib/portfolio-types";

export const dynamic = "force-dynamic";

const portfolioSchema = z.object({
  id: z.number().int(),
  title_line1: z.string().trim().min(1).max(200),
  title_line2: z.string().trim().max(200),
  meta: z.string().trim().max(500),
  image_url: z.string().max(1000).nullable(),
  sort_order: z.number().int().min(0).max(100000),
}).strict();

export async function GET() {
  const { response } = await adminApiResponse();
  if (response) return response;
  try {
    const items = await rows(
      "SELECT id, title_line1, title_line2, meta, image_url, sort_order FROM portfolio_items ORDER BY sort_order, id"
    );
    return NextResponse.json(items, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load portfolio." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  const { user, response } = await adminApiResponse();
  if (response || !user) return response;
  if (!(await checkRateLimit(`portfolio:${user.id}`, 30, 60))) {
    return NextResponse.json({ error: "Too many changes. Try again shortly." }, { status: 429 });
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = portfolioSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Portfolio data did not pass validation." }, { status: 400 });
  const item = parsed.data;
  if (item.image_url && !/^\/api\/media\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(item.image_url)) {
    return NextResponse.json({ error: "Use a locally uploaded portfolio image." }, { status: 400 });
  }

  try {
    let id: number;
    if (item.id < 0) {
      const result = await run(
        `INSERT INTO portfolio_items (title_line1, title_line2, meta, image_url, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [item.title_line1, item.title_line2, item.meta, item.image_url, item.sort_order]
      );
      id = result.insertId;
    } else {
      await run(
        `UPDATE portfolio_items SET title_line1 = ?, title_line2 = ?, meta = ?, image_url = ?, sort_order = ? WHERE id = ?`,
        [item.title_line1, item.title_line2, item.meta, item.image_url, item.sort_order, item.id]
      );
      id = item.id;
    }
    const saved = await rows<PortfolioItem & import("mysql2/promise").RowDataPacket>(
      "SELECT id, title_line1, title_line2, meta, image_url, sort_order FROM portfolio_items WHERE id = ? LIMIT 1",
      [id]
    );
    await run(
      "INSERT INTO audit_log (actor_id, action, target_type, target_id, ip_hash) VALUES (?, 'portfolio.save', 'portfolio_item', ?, ?)",
      [user.id, String(id), sha256(clientAddress(request))]
    );
    revalidatePath("/");
    return NextResponse.json(saved[0] as PortfolioItem);
  } catch {
    return NextResponse.json({ error: "Could not save portfolio item." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  const { user, response } = await adminApiResponse();
  if (response || !user) return response;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = z.object({ id: z.number().int().positive() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid portfolio item." }, { status: 400 });
  try {
    const old = await rows<PortfolioItem & import("mysql2/promise").RowDataPacket>(
      "SELECT id, title_line1, title_line2, meta, image_url, sort_order FROM portfolio_items WHERE id = ? LIMIT 1",
      [parsed.data.id]
    );
    await run("DELETE FROM portfolio_items WHERE id = ?", [parsed.data.id]);
    await deletePortfolioImage(old[0]?.image_url ?? null);
    await run(
      "INSERT INTO audit_log (actor_id, action, target_type, target_id, ip_hash) VALUES (?, 'portfolio.delete', 'portfolio_item', ?, ?)",
      [user.id, String(parsed.data.id), sha256(clientAddress(request))]
    );
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete portfolio item." }, { status: 500 });
  }
}
