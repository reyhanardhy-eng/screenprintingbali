import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDb, rows } from "@/lib/db";
import {
  DEFAULT_LIVECHAT_WIDGET,
  type LivechatApiKeySource,
} from "@/lib/livechat-shared";
import type { LivechatAdminSettings } from "@/lib/livechat-shared";
import { DEFAULT_LIVECHAT_SYSTEM_PROMPT } from "@/lib/livechat-prompts";

export { DEFAULT_LIVECHAT_SYSTEM_PROMPT } from "@/lib/livechat-prompts";
export { DEFAULT_LIVECHAT_WIDGET } from "@/lib/livechat-shared";
export type { LivechatApiKeySource, LivechatAdminSettings } from "@/lib/livechat-shared";

export type LivechatRuntimeConfig = {
  enabled: boolean;
  model: string;
  systemPrompt: string;
  apiKey: string | null;
  apiKeySource: LivechatApiKeySource;
  title: string;
  subtitle: string;
  welcome: string;
  privacyNote: string;
  buttonLabel: string;
  whatsappUrl: string;
};

type LivechatSettingsRow = RowDataPacket & {
  enabled: number;
  model: string;
  system_prompt: string | null;
  api_key_source: LivechatApiKeySource;
  api_key_enc: string | null;
  chat_title: string;
  chat_subtitle: string;
  chat_welcome: string;
  chat_privacy_note: string;
  chat_button_label: string;
  whatsapp_url: string;
};

let schemaPromise: Promise<void> | undefined;

export async function ensureLivechatSettingsTable(): Promise<void> {
  schemaPromise ??= getDb().query(`
    CREATE TABLE IF NOT EXISTS livechat_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      enabled TINYINT(1) NOT NULL DEFAULT 0,
      model VARCHAR(120) NOT NULL DEFAULT 'gpt-5.4',
      system_prompt TEXT NULL,
      api_key_source ENUM('environment', 'database', 'disabled') NOT NULL DEFAULT 'environment',
      api_key_enc TEXT NULL,
      chat_title VARCHAR(120) NOT NULL DEFAULT 'Ask our AI assistant',
      chat_subtitle VARCHAR(240) NOT NULL DEFAULT 'For exact quotes, we’ll connect you with the team on WhatsApp.',
      chat_welcome VARCHAR(300) NOT NULL DEFAULT 'Ask about printing methods, minimums, and how to get started.',
      chat_privacy_note VARCHAR(300) NOT NULL DEFAULT 'Pesan dikirim ke layanan AI untuk dijawab. Jangan kirim password atau detail pembayaran.',
      chat_button_label VARCHAR(50) NOT NULL DEFAULT 'Chat with us',
      whatsapp_url VARCHAR(500) NOT NULL DEFAULT 'https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20a%20print%20order',
      updated_by CHAR(36) NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT livechat_settings_updated_by_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).then(() => undefined).catch((error: unknown) => {
    schemaPromise = undefined;
    throw error;
  });
  await schemaPromise;
}

function encryptionKey(): Buffer {
  const encoded = process.env.MFA_ENCRYPTION_KEY;
  if (!encoded) throw new Error("MFA_ENCRYPTION_KEY is required to encrypt the livechat API key.");
  const baseKey = Buffer.from(encoded, "base64");
  if (baseKey.length !== 32) throw new Error("MFA_ENCRYPTION_KEY must contain 32 bytes.");
  // Derive a purpose-specific key so bot credentials never use the MFA key directly.
  return createHmac("sha256", baseKey).update("screenprintingbali/livechat-api-key/v1").digest();
}

export function encryptLivechatApiKey(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return ["v1", iv, cipher.getAuthTag(), ciphertext]
    .map((part) => typeof part === "string" ? part : part.toString("base64url"))
    .join(".");
}

function decryptLivechatApiKey(value: string): string {
  const [version, ivPart, tagPart, bodyPart] = value.split(".");
  if (version !== "v1" || !ivPart || !tagPart || !bodyPart) {
    throw new Error("Invalid encrypted livechat API key.");
  }
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(bodyPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function environmentFallback(): LivechatRuntimeConfig {
  const apiKey = process.env.ZROUTER_API_KEY?.trim() || null;
  return {
    enabled: Boolean(apiKey),
    model: process.env.ZROUTER_MODEL?.trim() || "gpt-5.4",
    systemPrompt: DEFAULT_LIVECHAT_SYSTEM_PROMPT,
    apiKey,
    apiKeySource: apiKey ? "environment" : "disabled",
    ...DEFAULT_LIVECHAT_WIDGET,
  };
}

function safeWhatsAppUrl(value: string | null | undefined): string {
  if (!value) return DEFAULT_LIVECHAT_WIDGET.whatsappUrl;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname === "wa.me" && /^\/\d{8,15}$/.test(url.pathname)) {
      return url.toString();
    }
  } catch { /* Use the safe default for malformed legacy data. */ }
  return DEFAULT_LIVECHAT_WIDGET.whatsappUrl;
}

export async function getLivechatRuntimeConfig(): Promise<LivechatRuntimeConfig> {
  let found: LivechatSettingsRow[];
  try {
    found = await rows<LivechatSettingsRow>(
      `SELECT enabled, model, system_prompt, api_key_source, api_key_enc,
              chat_title, chat_subtitle, chat_welcome, chat_privacy_note,
              chat_button_label, whatsapp_url
       FROM livechat_settings WHERE id = 1 LIMIT 1`
    );
  } catch {
    // Keep the existing Hostinger environment configuration working before the settings table exists.
    return environmentFallback();
  }

  const row = found[0];
  if (!row) return environmentFallback();

  let apiKey: string | null = null;
  if (row.api_key_source === "database" && row.api_key_enc) {
    apiKey = decryptLivechatApiKey(row.api_key_enc);
  } else if (row.api_key_source === "environment") {
    apiKey = process.env.ZROUTER_API_KEY?.trim() || null;
  }

  return {
    enabled: Boolean(row.enabled),
    model: row.model,
    systemPrompt: row.system_prompt?.trim() || DEFAULT_LIVECHAT_SYSTEM_PROMPT,
    apiKey,
    apiKeySource: row.api_key_source,
    title: row.chat_title,
    subtitle: row.chat_subtitle,
    welcome: row.chat_welcome,
    privacyNote: row.chat_privacy_note,
    buttonLabel: row.chat_button_label,
    whatsappUrl: safeWhatsAppUrl(row.whatsapp_url),
  };
}

export async function getAdminLivechatSettings() {
  const config = await getLivechatRuntimeConfig();
  const settings: LivechatAdminSettings = {
    enabled: config.enabled,
    model: config.model,
    systemPrompt: config.systemPrompt,
    apiKeySource: config.apiKeySource,
    apiKeyConfigured: Boolean(config.apiKey),
    ...DEFAULT_LIVECHAT_WIDGET,
    title: config.title,
    subtitle: config.subtitle,
    welcome: config.welcome,
    privacyNote: config.privacyNote,
    buttonLabel: config.buttonLabel,
    whatsappUrl: config.whatsappUrl,
  };
  return settings;
}
