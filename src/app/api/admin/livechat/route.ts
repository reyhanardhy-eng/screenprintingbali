import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { adminApiResponse } from "@/lib/admin-api";
import { getDb, rows } from "@/lib/db";
import {
  DEFAULT_LIVECHAT_SYSTEM_PROMPT,
  ensureLivechatSettingsTable,
  encryptLivechatApiKey,
  getAdminLivechatSettings,
  type LivechatApiKeySource,
} from "@/lib/livechat-config";
import { assertSameOrigin, checkRateLimit, clientAddress, sha256 } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const httpsWhatsAppUrl = z.string().trim().url().max(500).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "wa.me" && /^\/\d{8,15}$/.test(url.pathname);
  } catch {
    return false;
  }
}, "Use a WhatsApp link such as https://wa.me/6281234567890.");

const settingsSchema = z.object({
  enabled: z.boolean(),
  model: z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/),
  systemPrompt: z.string().trim().min(1).max(8000),
  apiKeySource: z.enum(["environment", "database", "disabled"]),
  apiKey: z.string().max(500).optional().refine((value) => !value?.trim() || value.trim().length >= 8),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(240),
  welcome: z.string().trim().max(300),
  privacyNote: z.string().trim().max(300),
  buttonLabel: z.string().trim().min(1).max(50),
  whatsappUrl: httpsWhatsAppUrl,
}).strict();

type ExistingSettingsRow = RowDataPacket & {
  api_key_source: LivechatApiKeySource;
  api_key_enc: string | null;
};

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  const { response } = await adminApiResponse();
  if (response) return response;

  try {
    await ensureLivechatSettingsTable();
    return NextResponse.json(await getAdminLivechatSettings(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return responseError("Pengaturan chatbot belum dapat dimuat. Periksa koneksi database dan MFA_ENCRYPTION_KEY.", 503);
  }
}

export async function PUT(request: NextRequest) {
  try { assertSameOrigin(request); } catch {
    return responseError("Request rejected.", 403);
  }

  const { user, response } = await adminApiResponse();
  if (response || !user) return response;
  if (!(await checkRateLimit(`admin-livechat-settings:${user.id}`, 12, 60))) {
    return responseError("Terlalu banyak perubahan. Coba lagi sebentar.", 429);
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return responseError("Pengaturan tidak valid.", 400);
  }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return responseError("Periksa kembali nilai pengaturan chatbot.", 400);

  const input = parsed.data;
  const newApiKey = input.apiKey?.trim() || "";
  let connection: PoolConnection | undefined;

  try {
    await ensureLivechatSettingsTable();
    const existing = await rows<ExistingSettingsRow>(
      "SELECT api_key_source, api_key_enc FROM livechat_settings WHERE id = 1 LIMIT 1"
    );
    let apiKeySource = input.apiKeySource;
    let apiKeyEnc = existing[0]?.api_key_enc ?? null;

    if (newApiKey) {
      apiKeySource = "database";
      apiKeyEnc = encryptLivechatApiKey(newApiKey);
    } else if (apiKeySource === "database") {
      if (existing[0]?.api_key_source !== "database" || !apiKeyEnc) {
        return responseError("Masukkan API key baru sebelum memilih penyimpanan terenkripsi.", 400);
      }
    } else {
      apiKeyEnc = null;
    }

    const apiKeyAvailable = apiKeySource === "database"
      ? Boolean(apiKeyEnc)
      : apiKeySource === "environment"
        ? Boolean(process.env.ZROUTER_API_KEY?.trim())
        : false;
    if (input.enabled && !apiKeyAvailable) {
      return responseError("Chatbot tidak bisa diaktifkan sebelum API key tersedia.", 400);
    }

    connection = await getDb().getConnection();
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO livechat_settings
         (id, enabled, model, system_prompt, api_key_source, api_key_enc,
          chat_title, chat_subtitle, chat_welcome, chat_privacy_note,
          chat_button_label, whatsapp_url, updated_by)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         enabled = VALUES(enabled), model = VALUES(model),
         system_prompt = VALUES(system_prompt), api_key_source = VALUES(api_key_source),
         api_key_enc = VALUES(api_key_enc), chat_title = VALUES(chat_title),
         chat_subtitle = VALUES(chat_subtitle), chat_welcome = VALUES(chat_welcome),
         chat_privacy_note = VALUES(chat_privacy_note), chat_button_label = VALUES(chat_button_label),
         whatsapp_url = VALUES(whatsapp_url), updated_by = VALUES(updated_by)`,
      [
        input.enabled ? 1 : 0,
        input.model,
        input.systemPrompt || DEFAULT_LIVECHAT_SYSTEM_PROMPT,
        apiKeySource,
        apiKeyEnc,
        input.title,
        input.subtitle,
        input.welcome,
        input.privacyNote,
        input.buttonLabel,
        input.whatsappUrl,
        user.id,
      ]
    );
    await connection.execute(
      "INSERT INTO audit_log (actor_id, action, target_type, target_id, ip_hash) VALUES (?, 'settings.livechat.update', 'livechat_settings', '1', ?)",
      [user.id, sha256(clientAddress(request))]
    );
    await connection.commit();
    revalidatePath("/");

    return NextResponse.json({
      ok: true,
      settings: {
        enabled: input.enabled,
        model: input.model,
        systemPrompt: input.systemPrompt,
        apiKeySource,
        apiKeyConfigured: apiKeyAvailable,
        title: input.title,
        subtitle: input.subtitle,
        welcome: input.welcome,
        privacyNote: input.privacyNote,
        buttonLabel: input.buttonLabel,
        whatsappUrl: input.whatsappUrl,
      },
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    if (connection) {
      try { await connection.rollback(); } catch { /* Connection may already be closed. */ }
    }
    return responseError("Pengaturan chatbot gagal disimpan.", 500);
  } finally {
    connection?.release();
  }
}
