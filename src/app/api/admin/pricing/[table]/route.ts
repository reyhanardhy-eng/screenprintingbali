import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { ExecuteValues } from "mysql2";
import { adminApiResponse } from "@/lib/admin-api";
import { getDb } from "@/lib/db";
import { assertSameOrigin, clientAddress, checkRateLimit, sha256 } from "@/lib/security";

export const dynamic = "force-dynamic";

const schemas = {
  products: {
    columns: ["slug", "label", "has_cut_option", "has_bag_size_option", "moq", "sort_order"],
    key: ["slug"],
    row: z.object({ slug: z.string().min(1).max(80), label: z.string().min(1).max(160), has_cut_option: z.boolean(), has_bag_size_option: z.boolean(), moq: z.number().int().min(1).max(100000), sort_order: z.number().int().min(0).max(100000) }).strict(),
  },
  fabrics: {
    columns: ["id", "product_slug", "value", "label", "price", "sort_order"],
    key: ["product_slug", "value"],
    row: z.object({ id: z.number().int().positive().optional(), product_slug: z.string().min(1).max(80), value: z.string().min(1).max(100), label: z.string().min(1).max(160), price: z.number().finite().min(0).max(1000000000), sort_order: z.number().int().min(0).max(100000) }).strict(),
  },
  cuts: {
    columns: ["slug", "label", "multiplier", "sort_order"],
    key: ["slug"],
    row: z.object({ slug: z.string().min(1).max(80), label: z.string().min(1).max(160), multiplier: z.number().finite().min(0).max(100), sort_order: z.number().int().min(0).max(100000) }).strict(),
  },
  bag_sizes: {
    columns: ["slug", "label", "dim", "multiplier", "sort_order"],
    key: ["slug"],
    row: z.object({ slug: z.string().min(1).max(80), label: z.string().min(1).max(160), dim: z.string().min(1).max(100), multiplier: z.number().finite().min(0).max(100), sort_order: z.number().int().min(0).max(100000) }).strict(),
  },
  print_methods: {
    columns: ["slug", "label", "type", "moq", "film_rate_per_cm2", "press_margin", "press_flat_cost", "base_cost", "per_extra_color", "setup_per_color", "applicable_products", "sort_order"],
    key: ["slug"],
    row: z.object({ slug: z.string().min(1).max(80), label: z.string().min(1).max(160), type: z.enum(["dtf", "screen"]), moq: z.number().int().min(1).max(100000), film_rate_per_cm2: z.number().finite().min(0).nullable(), press_margin: z.number().finite().min(0).nullable(), press_flat_cost: z.number().finite().min(0).nullable(), base_cost: z.number().finite().min(0).nullable(), per_extra_color: z.number().finite().min(0).nullable(), setup_per_color: z.number().finite().min(0).nullable(), applicable_products: z.array(z.string().max(80)).max(50).nullable(), sort_order: z.number().int().min(0).max(100000) }).strict(),
  },
  design_sizes: {
    columns: ["slug", "label", "dim", "area_cm2", "multiplier", "sort_order"],
    key: ["slug"],
    row: z.object({ slug: z.string().min(1).max(80), label: z.string().min(1).max(160), dim: z.string().min(1).max(100), area_cm2: z.number().finite().min(0).max(100000), multiplier: z.number().finite().min(0).max(100), sort_order: z.number().int().min(0).max(100000) }).strict(),
  },
} as const;

type TableName = keyof typeof schemas;

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ table: string }> }
) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const { user, response } = await adminApiResponse();
  if (response || !user) return response;
  if (!(await checkRateLimit(`pricing:${user.id}`, 60, 60))) {
    return NextResponse.json({ error: "Too many updates. Try again shortly." }, { status: 429 });
  }

  const { table } = await context.params;
  if (!Object.hasOwn(schemas, table)) {
    return NextResponse.json({ error: "Unknown pricing table." }, { status: 404 });
  }
  const name = table as TableName;
  const spec = schemas[name];
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = z.array(spec.row).min(1).max(500).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Pricing data did not pass validation." }, { status: 400 });

  const pool = getDb();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const columns = [...spec.columns];
    const updates = columns.filter((column) => !(spec.key as readonly string[]).includes(column));
    const placeholders = columns.map(() => "?").join(", ");
    const sql = `INSERT INTO ${name} (${columns.join(", ")}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates.map((column) => `${column} = VALUES(${column})`).join(", ")}`;

    for (const source of parsed.data) {
      const row = source as Record<string, unknown>;
      const values = columns.map((column) => {
        const value = row[column];
        return column === "applicable_products" && value !== null
          ? JSON.stringify(value)
          : value ?? null;
      });
      await connection.execute(sql, values as ExecuteValues[]);
    }

    await connection.execute(
      "INSERT INTO audit_log (actor_id, action, target_type, target_id, ip_hash) VALUES (?, 'pricing.update', ?, NULL, ?)",
      [user.id, name, sha256(clientAddress(request))]
    );
    await connection.commit();
    return NextResponse.json({ ok: true, saved: parsed.data.length });
  } catch {
    await connection.rollback();
    return NextResponse.json({ error: "Could not save pricing data." }, { status: 500 });
  } finally {
    connection.release();
  }
}
