import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  DEFAULT_LIVECHAT_WIDGET,
  getLivechatRuntimeConfig,
} from "@/lib/livechat-config";
import { LIVECHAT_SAFETY_RULES } from "@/lib/livechat-prompts";
import { assertSameOrigin, checkRateLimit, clientAddress, sha256 } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
}).strict();

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(12),
}).strict();

const localRateLimits = new Map<string, { count: number; windowStartedAt: number }>();

function checkLocalRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = sha256(ip);
  const windowMs = 15 * 60 * 1000;
  const previous = localRateLimits.get(key);
  if (!previous || previous.windowStartedAt + windowMs <= now) {
    localRateLimits.set(key, { count: 1, windowStartedAt: now });
  } else if (previous.count >= 20) {
    return false;
  } else {
    previous.count += 1;
  }

  if (localRateLimits.size > 5000) {
    for (const [bucket, value] of localRateLimits) {
      if (value.windowStartedAt + windowMs <= now) localRateLimits.delete(bucket);
    }
    while (localRateLimits.size > 5000) {
      const oldest = localRateLimits.keys().next().value;
      if (!oldest) break;
      localRateLimits.delete(oldest);
    }
  }
  return true;
}

async function allowMessage(ip: string): Promise<boolean> {
  try {
    return await checkRateLimit(`livechat:${ip}`, 20, 900);
  } catch {
    // Keep chat available during a database outage with a bounded process-local fallback.
    return checkLocalRateLimit(ip);
  }
}

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  try {
    const config = await getLivechatRuntimeConfig();
    return NextResponse.json(
      {
        enabled: config.enabled && Boolean(config.apiKey),
        title: config.title,
        subtitle: config.subtitle,
        welcome: config.welcome,
        privacyNote: config.privacyNote,
        buttonLabel: config.buttonLabel,
        whatsappUrl: config.whatsappUrl,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { enabled: false, ...DEFAULT_LIVECHAT_WIDGET },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
  } catch {
    return responseError("Request rejected.", 403);
  }

  let config;
  try {
    config = await getLivechatRuntimeConfig();
  } catch {
    return responseError("AI chat belum dapat dimuat. Silakan hubungi kami lewat WhatsApp.", 503);
  }
  if (!config.enabled || !config.apiKey) return responseError("AI chat belum dikonfigurasi.", 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return responseError("Pesan tidak valid.", 400);
  }

  const parsed = requestSchema.safeParse(body);
  const parsedMessages = parsed.success ? parsed.data.messages : [];
  if (!parsed.success || parsedMessages[parsedMessages.length - 1]?.role !== "user") {
    return responseError("Pesan tidak valid.", 400);
  }

  try {
    const allowed = await allowMessage(clientAddress(request));
    if (!allowed) return responseError("Terlalu banyak pesan. Coba lagi beberapa menit.", 429);

    const upstream = await fetch("https://api.zrouter.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: `${config.systemPrompt}\n\n${LIVECHAT_SAFETY_RULES}` },
          ...parsedMessages,
        ],
        max_tokens: 400,
        temperature: 0.4,
        stream: false,
      }),
      signal: AbortSignal.timeout(25000),
      cache: "no-store",
    });

    if (!upstream.ok) {
      let errorCode = "upstream_error";
      try {
        const errorBody = await upstream.json() as { error?: { code?: unknown; type?: unknown } };
        const candidate = errorBody.error?.code ?? errorBody.error?.type;
        if (typeof candidate === "string") errorCode = candidate.slice(0, 80);
      } catch { /* Keep only the status when the provider returns a non-JSON error. */ }
      console.error("[api/livechat] ZRouter request failed", { status: upstream.status, code: errorCode });
      return responseError("Chat sedang tidak tersedia. Silakan hubungi kami lewat WhatsApp.", 502);
    }

    const result = await upstream.json() as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      console.error("[api/livechat] ZRouter returned no text response");
      return responseError("Chat belum mendapat jawaban. Silakan hubungi kami lewat WhatsApp.", 502);
    }

    return NextResponse.json(
      { reply: reply.trim().slice(0, 5000) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const details = error && typeof error === "object"
      ? error as { name?: unknown; code?: unknown }
      : null;
    console.error("[api/livechat] Request failed", {
      name: typeof details?.name === "string" ? details.name : "UnknownError",
      code: typeof details?.code === "string" ? details.code : "UNKNOWN",
    });
    return responseError("Chat sedang tidak tersedia. Silakan hubungi kami lewat WhatsApp.", 503);
  }
}
