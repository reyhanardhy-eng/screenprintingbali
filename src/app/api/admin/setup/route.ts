import { NextResponse, type NextRequest } from "next/server";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { issueSession } from "@/lib/auth";
import { assertSameOrigin, checkRateLimit, clientAddress, hashPassword, sha256 } from "@/lib/security";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";
const schema = z.object({
  token: z.string().min(32).max(256),
  email: z.string().trim().email().max(254),
  full_name: z.string().trim().min(1).max(160),
  password: z.string().min(12).max(128),
}).strict();

export async function GET() {
  try {
    const admins = await getDb().query<RowDataPacket[]>("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    return NextResponse.json({ available: admins[0].length === 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ available: false, error: "Database is not ready." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }
  const ip = clientAddress(request);
  if (!(await checkRateLimit(`admin-setup:${ip}`, 5, 3600))) {
    return NextResponse.json({ error: "Too many setup attempts." }, { status: 429 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid setup request." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Check the setup fields and use a password with at least 12 characters." }, { status: 400 });

  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN || "";
  const submitted = Buffer.from(parsed.data.token);
  const configured = Buffer.from(expected);
  if (configured.length < 32 || submitted.length !== configured.length || !timingSafeEqual(submitted, configured)) {
    return NextResponse.json({ error: "Setup token is invalid." }, { status: 403 });
  }

  const pool = getDb();
  const connection = await pool.getConnection();
  let userId = "";
  try {
    const [lockRows] = await connection.query<RowDataPacket[]>("SELECT GET_LOCK('screenprintingbali_admin_bootstrap', 5) AS acquired");
    if (Number(lockRows[0]?.acquired) !== 1) return NextResponse.json({ error: "Admin setup is busy. Try again." }, { status: 503 });
    const [existing] = await connection.query<RowDataPacket[]>("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (existing.length) return NextResponse.json({ error: "Initial admin setup has already been completed." }, { status: 409 });

    userId = randomUUID();
    await connection.execute(
      `INSERT INTO users (id, email, full_name, password_hash, role, email_verified_at, created_at)
       VALUES (?, ?, ?, ?, 'admin', UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
      [userId, parsed.data.email.toLowerCase(), parsed.data.full_name, await hashPassword(parsed.data.password)]
    );
    await connection.execute(
      "INSERT INTO audit_log (actor_id, action, target_type, target_id, ip_hash) VALUES (?, 'admin.bootstrap', 'user', ?, ?)",
      [userId, userId, sha256(ip)]
    );
  } catch {
    return NextResponse.json({ error: "Could not create the initial admin." }, { status: 500 });
  } finally {
    try { await connection.query("SELECT RELEASE_LOCK('screenprintingbali_admin_bootstrap')"); } catch { /* connection may not have acquired the lock */ }
    connection.release();
  }

  await issueSession(userId, "mfa_enrollment");
  return NextResponse.json({ ok: true, next: "/admin/security/mfa" }, { status: 201 });
}
