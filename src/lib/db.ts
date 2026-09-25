import "server-only";
import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import type { ExecuteValues } from "mysql2";

let pool: Pool | undefined;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getDb(): Pool {
  if (pool) return pool;

  const common = {
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
    maxIdle: 2,
    idleTimeout: 60_000,
    enableKeepAlive: true,
    timezone: "Z",
    decimalNumbers: true,
    multipleStatements: false,
  } as const;

  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    if (url.protocol !== "mysql:") throw new Error("DATABASE_URL must use the mysql:// scheme.");
    pool = mysql.createPool({
      ...common,
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    });
  } else {
    pool = mysql.createPool({
      ...common,
      host: required("DB_HOST"),
      port: Number(process.env.DB_PORT || 3306),
      user: required("DB_USER"),
      password: required("DB_PASSWORD"),
      database: required("DB_NAME"),
    });
  }

  return pool;
}

export async function rows<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  values: readonly unknown[] = []
): Promise<T[]> {
  const [result] = await getDb().execute<T[]>(sql, [...values] as ExecuteValues[]);
  return result;
}

export async function run(sql: string, values: readonly unknown[] = []) {
  const [result] = await getDb().execute<ResultSetHeader>(sql, [...values] as ExecuteValues[]);
  return result;
}
