import "server-only";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDb, rows, run } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/security";

export const LIVECHAT_COOKIE_NAME = process.env.NODE_ENV === "production"
  ? "__Host-spb_ai_chat"
  : "spb_ai_chat";
export const LIVECHAT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
export const LIVECHAT_HISTORY_LIMIT = 12;

export type StoredChatMessage = { role: "user" | "assistant"; content: string };

type SessionRow = RowDataPacket & { id: string };
type MessageRow = RowDataPacket & { role: StoredChatMessage["role"]; body: string };

let schemaPromise: Promise<void> | undefined;

export async function ensureLivechatHistoryTables(): Promise<void> {
  schemaPromise ??= (async () => {
    await getDb().query(`
      CREATE TABLE IF NOT EXISTS ai_chat_sessions (
        id CHAR(36) NOT NULL PRIMARY KEY,
        token_hash CHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX ai_chat_sessions_expiry_idx (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await getDb().query(`
      CREATE TABLE IF NOT EXISTS ai_chat_messages (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        session_id CHAR(36) NOT NULL,
        role ENUM('user', 'assistant') NOT NULL,
        body TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX ai_chat_messages_session_idx (session_id, id),
        CONSTRAINT ai_chat_messages_session_fk FOREIGN KEY (session_id)
          REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
        CONSTRAINT ai_chat_messages_body_nonempty CHECK (CHAR_LENGTH(TRIM(body)) > 0)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  })().catch((error: unknown) => {
    schemaPromise = undefined;
    throw error;
  });
  await schemaPromise;
}

export async function getOrCreateLivechatSession(cookieValue?: string): Promise<{
  id: string;
  token: string;
}> {
  await ensureLivechatHistoryTables();
  await run("DELETE FROM ai_chat_sessions WHERE expires_at <= UTC_TIMESTAMP() LIMIT 100");

  if (cookieValue && /^[A-Za-z0-9_-]{40,50}$/.test(cookieValue)) {
    const tokenHash = sha256(cookieValue);
    const existing = await rows<SessionRow>(
      "SELECT id FROM ai_chat_sessions WHERE token_hash = ? AND expires_at > UTC_TIMESTAMP() LIMIT 1",
      [tokenHash]
    );
    if (existing[0]) {
      await run(
        "UPDATE ai_chat_sessions SET expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 180 DAY) WHERE id = ?",
        [existing[0].id]
      );
      return { id: existing[0].id, token: cookieValue };
    }
  }

  const token = randomToken();
  const id = randomUUID();
  await run(
    "INSERT INTO ai_chat_sessions (id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 180 DAY))",
    [id, sha256(token)]
  );
  return { id, token };
}

export async function getLivechatHistory(sessionId: string): Promise<StoredChatMessage[]> {
  const found = await rows<MessageRow>(
    `SELECT role, body FROM (
       SELECT id, role, body FROM ai_chat_messages
       WHERE session_id = ? ORDER BY id DESC LIMIT ${LIVECHAT_HISTORY_LIMIT}
     ) AS recent_messages ORDER BY id ASC`,
    [sessionId]
  );
  return found.map((message) => ({ role: message.role, content: message.body }));
}

export async function saveLivechatExchange(
  sessionId: string,
  userMessage: string,
  assistantMessage: string
): Promise<void> {
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO ai_chat_messages (session_id, role, body) VALUES (?, 'user', ?), (?, 'assistant', ?)",
      [sessionId, userMessage, sessionId, assistantMessage]
    );
    await connection.execute(
      "UPDATE ai_chat_sessions SET expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 180 DAY) WHERE id = ?",
      [sessionId]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  try {
    await run(
      `DELETE FROM ai_chat_messages WHERE session_id = ? AND id NOT IN (
         SELECT id FROM (
           SELECT id FROM ai_chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT 100
         ) AS retained_messages
       )`,
      [sessionId, sessionId]
    );
  } catch {
    // Exchange persistence has already committed; retention cleanup can retry later.
  }
}
