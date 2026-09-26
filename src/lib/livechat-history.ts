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

export type StoredChatMessage = { role: "user" | "assistant" | "admin"; content: string };

type SessionRow = RowDataPacket & { id: string; human_mode: number };
type MessageRow = RowDataPacket & { id?: number; role: StoredChatMessage["role"]; body: string; created_at?: Date | string };
type ConversationRow = RowDataPacket & {
  id: string;
  human_mode: number;
  created_at: Date | string;
  updated_at: Date | string;
  message_count: number;
  last_role: StoredChatMessage["role"] | null;
  last_message: string | null;
};

let schemaPromise: Promise<void> | undefined;

export async function ensureLivechatHistoryTables(): Promise<void> {
  schemaPromise ??= (async () => {
    await getDb().query(`
      CREATE TABLE IF NOT EXISTS ai_chat_sessions (
        id CHAR(36) NOT NULL PRIMARY KEY,
        token_hash CHAR(64) NOT NULL UNIQUE,
        human_mode TINYINT(1) NOT NULL DEFAULT 0,
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
        role ENUM('user', 'assistant', 'admin') NOT NULL,
        body TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX ai_chat_messages_session_idx (session_id, id),
        CONSTRAINT ai_chat_messages_session_fk FOREIGN KEY (session_id)
          REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
        CONSTRAINT ai_chat_messages_body_nonempty CHECK (CHAR_LENGTH(TRIM(body)) > 0)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    try {
      await getDb().query("ALTER TABLE ai_chat_sessions ADD COLUMN human_mode TINYINT(1) NOT NULL DEFAULT 0");
    } catch (error) {
      const code = error && typeof error === "object" ? (error as { code?: unknown }).code : null;
      if (code !== "ER_DUP_FIELDNAME" && code !== "ER_DUP_COLUMN_NAME") throw error;
    }
    await getDb().query("ALTER TABLE ai_chat_messages MODIFY role ENUM('user', 'assistant', 'admin') NOT NULL");
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

export type AdminLivechatConversation = {
  id: string;
  humanMode: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  messageCount: number;
  lastRole: StoredChatMessage["role"] | null;
  lastMessage: string | null;
};

export async function getAdminLivechatConversations(): Promise<AdminLivechatConversation[]> {
  await ensureLivechatHistoryTables();
  const found = await rows<ConversationRow>(
    `SELECT s.id, s.human_mode, s.created_at, s.updated_at,
       (SELECT COUNT(*) FROM ai_chat_messages m WHERE m.session_id = s.id) AS message_count,
       (SELECT m.role FROM ai_chat_messages m WHERE m.session_id = s.id ORDER BY m.id DESC LIMIT 1) AS last_role,
       (SELECT m.body FROM ai_chat_messages m WHERE m.session_id = s.id ORDER BY m.id DESC LIMIT 1) AS last_message
     FROM ai_chat_sessions s
     WHERE s.expires_at > UTC_TIMESTAMP()
       AND EXISTS (SELECT 1 FROM ai_chat_messages m WHERE m.session_id = s.id)
     ORDER BY s.updated_at DESC LIMIT 100`
  );
  return found.map((row) => ({
    id: row.id,
    humanMode: Boolean(row.human_mode),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messageCount: Number(row.message_count),
    lastRole: row.last_role,
    lastMessage: row.last_message,
  }));
}

export async function getAdminLivechatMessages(sessionId: string): Promise<StoredChatMessage[]> {
  await ensureLivechatHistoryTables();
  const found = await rows<MessageRow>(
    `SELECT role, body FROM (
       SELECT id, role, body FROM ai_chat_messages
       WHERE session_id = ? ORDER BY id DESC LIMIT 200
     ) AS recent_messages ORDER BY id ASC`,
    [sessionId]
  );
  return found.map((message) => ({ role: message.role, content: message.body }));
}

export async function deleteAdminLivechatConversation(
  sessionId: string,
  actorId: string,
  ipHash: string
): Promise<boolean> {
  await ensureLivechatHistoryTables();
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    const [sessionRows] = await connection.execute<SessionRow[]>(
      "SELECT id, human_mode FROM ai_chat_sessions WHERE id = ? FOR UPDATE",
      [sessionId]
    );
    if (!sessionRows[0]) {
      await connection.commit();
      return false;
    }
    await connection.execute("DELETE FROM ai_chat_sessions WHERE id = ?", [sessionId]);
    await connection.execute(
      "INSERT INTO audit_log (actor_id, action, target_type, target_id, ip_hash) VALUES (?, 'chat.delete', 'ai_chat_session', ?, ?)",
      [actorId, sessionId, ipHash]
    );
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function isLivechatHumanMode(sessionId: string): Promise<boolean> {
  await ensureLivechatHistoryTables();
  const found = await rows<SessionRow>(
    "SELECT id, human_mode FROM ai_chat_sessions WHERE id = ? AND expires_at > UTC_TIMESTAMP() LIMIT 1",
    [sessionId]
  );
  return Boolean(found[0]?.human_mode);
}

export async function saveLivechatVisitorMessage(sessionId: string, message: string): Promise<void> {
  await ensureLivechatHistoryTables();
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO ai_chat_messages (session_id, role, body) VALUES (?, 'user', ?)",
      [sessionId, message]
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
  await trimLivechatMessages(sessionId);
}

export async function saveAdminLivechatReply(sessionId: string, message: string): Promise<void> {
  await ensureLivechatHistoryTables();
  const connection = await getDb().getConnection();
  try {
    await connection.beginTransaction();
    const [sessionRows] = await connection.execute<SessionRow[]>(
      "SELECT id, human_mode FROM ai_chat_sessions WHERE id = ? AND expires_at > UTC_TIMESTAMP() FOR UPDATE",
      [sessionId]
    );
    if (!sessionRows[0]) throw new Error("Chat conversation not found.");
    await connection.execute(
      "UPDATE ai_chat_sessions SET human_mode = 1, expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 180 DAY) WHERE id = ?",
      [sessionId]
    );
    await connection.execute(
      "INSERT INTO ai_chat_messages (session_id, role, body) VALUES (?, 'admin', ?)",
      [sessionId, message]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  await trimLivechatMessages(sessionId);
}

export async function setLivechatHumanMode(sessionId: string, enabled: boolean): Promise<void> {
  await ensureLivechatHistoryTables();
  const result = await run(
    "UPDATE ai_chat_sessions SET human_mode = ?, expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 180 DAY) WHERE id = ? AND expires_at > UTC_TIMESTAMP()",
    [enabled ? 1 : 0, sessionId]
  );
  if (result.affectedRows === 0) throw new Error("Chat conversation not found.");
}

export async function saveLivechatExchange(
  sessionId: string,
  userMessage: string,
  assistantMessage: string
): Promise<boolean> {
  const connection = await getDb().getConnection();
  let handedToAdmin = false;
  try {
    await connection.beginTransaction();
    const [sessionRows] = await connection.execute<SessionRow[]>(
      "SELECT id, human_mode FROM ai_chat_sessions WHERE id = ? AND expires_at > UTC_TIMESTAMP() FOR UPDATE",
      [sessionId]
    );
    if (!sessionRows[0]) throw new Error("Chat session not found.");
    handedToAdmin = Boolean(sessionRows[0].human_mode);
    if (handedToAdmin) {
      await connection.execute(
        "INSERT INTO ai_chat_messages (session_id, role, body) VALUES (?, 'user', ?)",
        [sessionId, userMessage]
      );
    } else {
      await connection.execute(
        "INSERT INTO ai_chat_messages (session_id, role, body) VALUES (?, 'user', ?), (?, 'assistant', ?)",
        [sessionId, userMessage, sessionId, assistantMessage]
      );
    }
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

  await trimLivechatMessages(sessionId);
  return handedToAdmin;
}

async function trimLivechatMessages(sessionId: string): Promise<void> {
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
    // Message persistence has already committed; retention cleanup can retry later.
  }
}
