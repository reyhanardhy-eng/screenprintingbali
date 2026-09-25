import { copyFile, mkdir, readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import { parse } from "csv-parse/sync";

const dataDir = resolve(process.argv[2] || "migration/data");
const storageDir = resolve(process.env.PORTFOLIO_STORAGE_DIR || join(process.cwd(), "var", "portfolio"));
const databaseUrl = process.env.DATABASE_URL;

function databaseConfig() {
  if (databaseUrl) return databaseUrl;
  const required = (name) => {
    if (!process.env[name]) throw new Error(`Missing ${name}.`);
    return process.env[name];
  };
  return {
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT || 3306),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
    timezone: "Z",
    multipleStatements: false,
  };
}

async function loadRows(name) {
  for (const extension of ["json", "csv"]) {
    try {
      const content = await readFile(join(dataDir, `${name}.${extension}`), "utf8");
      if (extension === "json") {
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) throw new Error(`${name}.json must contain a JSON array.`);
        return parsed;
      }
      return parse(content, { columns: true, skip_empty_lines: true, bom: true, relax_column_count: false });
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
  }
  return [];
}

function dateValue(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid date in export: ${value}`);
  return date;
}

function booleanValue(value) {
  return value === true || value === 1 || value === "1" || value === "true" || value === "t";
}

function objectValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function jsonArray(value) {
  if (value == null || value === "" || value === "{}") return null;
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") throw new Error("Expected an array field in pricing export.");
  if (value.startsWith("{")) return value.slice(1, -1).split(",").filter(Boolean);
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : null;
}

async function upsert(connection, table, columns, keyColumns, record) {
  const placeholders = columns.map(() => "?").join(", ");
  const updateColumns = columns.filter((column) => !keyColumns.includes(column));
  const updates = updateColumns.length
    ? ` ON DUPLICATE KEY UPDATE ${updateColumns.map((column) => `${column} = VALUES(${column})`).join(", ")}`
    : " ON DUPLICATE KEY UPDATE " + keyColumns.map((column) => `${column} = VALUES(${column})`).join(", ");
  const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})${updates}`;
  await connection.execute(sql, columns.map((column) => record[column] ?? null));
}

async function main() {
  const admins = await loadRows("admins");
  const adminIds = new Set(admins.map((row) => String(row.user_id || row.id)));
  const users = await loadRows("users");
  const oauthRows = await loadRows("oauth_accounts");
  const portfolioRows = await loadRows("portfolio_items");
  const mediaMap = await loadRows("portfolio_media_map");
  const mediaLookup = Array.isArray(mediaMap)
    ? Object.fromEntries(mediaMap.map((row) => [row.image_url, row.file_name]))
    : mediaMap;
  const fileLookup = new Map();
  await mkdir(storageDir, { recursive: true, mode: 0o750 });
  let missingMedia = 0;
  for (const item of portfolioRows) {
    const oldUrl = item.image_url;
    const sourceName = oldUrl ? mediaLookup?.[oldUrl] : null;
    if (!sourceName) {
      if (oldUrl) missingMedia += 1;
      continue;
    }
    const safeName = basename(String(sourceName));
    if (safeName !== sourceName || !/^[A-Za-z0-9_-]{1,120}\.(?:jpg|jpeg|png|webp)$/i.test(safeName)) {
      throw new Error(`Unsafe image filename in portfolio_media_map: ${sourceName}`);
    }
    if (!fileLookup.has(oldUrl)) {
      const ext = safeName.toLowerCase().endsWith(".jpeg") ? "jpg" : safeName.split(".").pop().toLowerCase();
      const targetName = `${randomUUID()}.${ext}`;
      await copyFile(join(dataDir, "media", safeName), join(storageDir, targetName));
      fileLookup.set(oldUrl, `/api/media/${targetName}`);
    }
  }

  const pool = mysql.createPool(databaseConfig());
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let importedUsers = 0;
    for (const source of users) {
      const id = String(source.id || "");
      if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error(`Invalid user ID in export: ${id}`);
      const email = String(source.email || `unavailable+${id}@invalid.local`).toLowerCase();
      const metadata = objectValue(source.raw_user_meta_data || source.user_metadata);
      await upsert(connection, "users", ["id", "email", "full_name", "password_hash", "role", "email_verified_at"], ["id"], {
        id,
        email,
        full_name: source.full_name || source.name || source.display_name || metadata.full_name || metadata.name || null,
        password_hash: null,
        role: adminIds.has(id) ? "admin" : "customer",
        email_verified_at: dateValue(source.email_verified_at || source.email_confirmed_at),
      });
      importedUsers += 1;
    }

    const pricing = [
      ["products", ["slug", "label", "has_cut_option", "has_bag_size_option", "moq", "sort_order"], ["slug"], (r) => ({ ...r, has_cut_option: booleanValue(r.has_cut_option), has_bag_size_option: booleanValue(r.has_bag_size_option), moq: Number(r.moq || 1), sort_order: Number(r.sort_order || 0) })],
      ["fabrics", ["id", "product_slug", "value", "label", "price", "sort_order"], ["id"], (r) => ({ ...r, id: r.id ? Number(r.id) : null, price: Number(r.price), sort_order: Number(r.sort_order || 0) })],
      ["cuts", ["slug", "label", "multiplier", "sort_order"], ["slug"], (r) => ({ ...r, multiplier: Number(r.multiplier), sort_order: Number(r.sort_order || 0) })],
      ["bag_sizes", ["slug", "label", "dim", "multiplier", "sort_order"], ["slug"], (r) => ({ ...r, multiplier: Number(r.multiplier), sort_order: Number(r.sort_order || 0) })],
      ["print_methods", ["slug", "label", "type", "moq", "film_rate_per_cm2", "press_margin", "press_flat_cost", "base_cost", "per_extra_color", "setup_per_color", "applicable_products", "sort_order"], ["slug"], (r) => ({ ...r, moq: Number(r.moq || 1), film_rate_per_cm2: r.film_rate_per_cm2 ? Number(r.film_rate_per_cm2) : null, press_margin: r.press_margin ? Number(r.press_margin) : null, press_flat_cost: r.press_flat_cost ? Number(r.press_flat_cost) : null, base_cost: r.base_cost ? Number(r.base_cost) : null, per_extra_color: r.per_extra_color ? Number(r.per_extra_color) : null, setup_per_color: r.setup_per_color ? Number(r.setup_per_color) : null, applicable_products: jsonArray(r.applicable_products), sort_order: Number(r.sort_order || 0) })],
      ["design_sizes", ["slug", "label", "dim", "area_cm2", "multiplier", "sort_order"], ["slug"], (r) => ({ ...r, area_cm2: Number(r.area_cm2), multiplier: Number(r.multiplier), sort_order: Number(r.sort_order || 0) })],
    ];
    const counts = {};
    for (const [table, columns, keys, transform] of pricing) {
      const data = await loadRows(table);
      for (const source of data) await upsert(connection, table, columns, keys, transform(source));
      counts[table] = data.length;
    }

    const portfolio = portfolioRows.map((item) => ({
      id: Number(item.id),
      title_line1: item.title_line1,
      title_line2: item.title_line2 || "",
      meta: item.meta || "",
      image_url: item.image_url ? fileLookup.get(item.image_url) || null : null,
      sort_order: Number(item.sort_order || 0),
      created_at: dateValue(item.created_at),
    }));
    for (const row of portfolio) {
      await upsert(connection, "portfolio_items", ["id", "title_line1", "title_line2", "meta", "image_url", "sort_order", "created_at"], ["id"], row);
    }
    counts.portfolio_items = portfolio.length;

    const conversations = await loadRows("conversations");
    for (const source of conversations) {
      await upsert(connection, "conversations", ["id", "visitor_id", "visitor_email", "status", "created_at", "last_message_at"], ["id"], {
        ...source,
        created_at: dateValue(source.created_at),
        last_message_at: dateValue(source.last_message_at || source.created_at),
      });
    }
    counts.conversations = conversations.length;

    const messages = await loadRows("messages");
    for (const source of messages) {
      await upsert(connection, "messages", ["id", "conversation_id", "sender", "sender_id", "body", "read_by_admin", "read_by_visitor", "created_at"], ["id"], {
        ...source,
        id: Number(source.id),
        read_by_admin: booleanValue(source.read_by_admin),
        read_by_visitor: booleanValue(source.read_by_visitor),
        created_at: dateValue(source.created_at),
      });
    }
    counts.messages = messages.length;

    let importedGoogleAccounts = 0;
    for (const source of oauthRows) {
      const identityData = objectValue(source.identity_data);
      const provider = String(source.provider || "").toLowerCase();
      const providerAccountId = source.provider_account_id || identityData.sub || source.provider_id;
      if (provider !== "google" || !providerAccountId || !source.user_id) continue;
      await upsert(connection, "oauth_accounts", ["provider", "provider_account_id", "user_id"], ["provider", "provider_account_id"], {
        provider: "google",
        provider_account_id: String(providerAccountId),
        user_id: String(source.user_id),
      });
      importedGoogleAccounts += 1;
    }
    counts.oauth_accounts = importedGoogleAccounts;
    await connection.commit();
    console.log(JSON.stringify({ importedUsers, counts, missingPortfolioImages: missingMedia }, null, 2));
    if (missingMedia) console.warn("Some portfolio images had no local export mapping and were imported without an image.");
    console.log("Imported legacy users have no password hash. Send password-reset links before switching live traffic.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Import failed.");
  process.exitCode = 1;
});
