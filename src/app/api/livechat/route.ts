import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  DEFAULT_LIVECHAT_WIDGET,
  getLivechatRuntimeConfig,
} from "@/lib/livechat-config";
import { LIVECHAT_RESPONSE_STYLE_RULES, LIVECHAT_SAFETY_RULES } from "@/lib/livechat-prompts";
import { assertSameOrigin, checkRateLimit, clientAddress, sha256 } from "@/lib/security";
import {
  getLivechatHistory,
  getOrCreateLivechatSession,
  isLivechatHumanMode,
  LIVECHAT_COOKIE_MAX_AGE,
  LIVECHAT_COOKIE_NAME,
  saveLivechatVisitorMessage,
  saveLivechatExchange,
  type StoredChatMessage,
} from "@/lib/livechat-history";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
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

function cleanAssistantReply(value: string): string {
  const rangeWord = /\b(?:yang|untuk|dengan|bisa|berapa|hari|harga|ukuran|pesan|saya|kami|kamu|anda|pcs|sablon|kaos)\b/i.test(value)
    ? " sampai "
    : " to ";
  return value
    .replace(/(\d)\s*[\p{Dash_Punctuation}\u2212]\s*(?=\d)/gu, (_match, number: string) => `${number}${rangeWord}`)
    .replace(/\p{Regional_Indicator}{2}/gu, "")
    .replace(/[#*0-9]\uFE0F?\u20E3/gu, "")
    .replace(/\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?/gu, "")
    .replace(/\p{Emoji_Modifier}/gu, "")
    .replace(/(?:[:;=8][)(DPp]|<3)/gi, "")
    .replace(/[\u200D\uFE0E\uFE0F]/g, "")
    .replace(/[\p{Dash_Punctuation}\u2212]+/gu, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 5000);
}

function cleanAssistantHistory(messages: StoredChatMessage[]) {
  return messages.flatMap((message) => {
    if (message.role !== "assistant") return [message];
    const content = cleanAssistantReply(message.content);
    return content ? [{ ...message, content }] : [];
  });
}

function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(LIVECHAT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: LIVECHAT_COOKIE_MAX_AGE,
  });
}

export async function GET(request: NextRequest) {
  try {
    const config = await getLivechatRuntimeConfig();
    const settings = {
      enabled: config.enabled && Boolean(config.apiKey),
      title: config.title,
      subtitle: config.subtitle,
      welcome: config.welcome,
      privacyNote: config.privacyNote,
      buttonLabel: config.buttonLabel,
      whatsappUrl: config.whatsappUrl,
    };
    if (request.nextUrl.searchParams.get("history") !== "1" || !settings.enabled) {
      return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
    }

    const session = await getOrCreateLivechatSession(request.cookies.get(LIVECHAT_COOKIE_NAME)?.value);
    const messages = cleanAssistantHistory(await getLivechatHistory(session.id));
    const humanMode = await isLivechatHumanMode(session.id);
    const response = NextResponse.json(
      { ...settings, messages, humanMode },
      { headers: { "Cache-Control": "no-store" } }
    );
    setSessionCookie(response, session.token);
    return response;
  } catch {
    if (request.nextUrl.searchParams.get("history") === "1") {
      return responseError("Chat history could not be loaded. Please reopen the chat.", 503);
    }
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return responseError("Please enter a valid message.", 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return responseError("Please enter a valid message.", 400);
  }

  try {
    const allowed = await allowMessage(clientAddress(request));
    if (!allowed) return responseError("You have sent too many messages. Please try again in a few minutes.", 429);

    const session = await getOrCreateLivechatSession(request.cookies.get(LIVECHAT_COOKIE_NAME)?.value);
    if (await isLivechatHumanMode(session.id)) {
      await saveLivechatVisitorMessage(session.id, parsed.data.message);
      const response = NextResponse.json(
        { handoff: true },
        { headers: { "Cache-Control": "no-store" } }
      );
      setSessionCookie(response, session.token);
      return response;
    }
    let config;
    try {
      config = await getLivechatRuntimeConfig();
    } catch {
      return responseError("The AI chat is unavailable. Please contact us on WhatsApp.", 503);
    }
    if (!config.enabled || !config.apiKey) return responseError("The AI chat is not configured yet.", 503);
    const history = cleanAssistantHistory(await getLivechatHistory(session.id));
    const upstream = await fetch("https://api.zrouter.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: `${config.systemPrompt}\n\n${LIVECHAT_RESPONSE_STYLE_RULES}\n\n${LIVECHAT_SAFETY_RULES}` },
          ...history.map((message) => ({
            role: message.role === "user" ? "user" as const : "assistant" as const,
            content: message.content,
          })),
          { role: "user", content: parsed.data.message },
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
      return responseError("Chat is temporarily unavailable. Please contact us on WhatsApp.", 502);
    }

    const result = await upstream.json() as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      console.error("[api/livechat] ZRouter returned no text response");
      return responseError("Chat could not generate a reply. Please contact us on WhatsApp.", 502);
    }

    const cleanReply = cleanAssistantReply(reply);
    if (!cleanReply) {
      return responseError("Chat could not generate a reply. Please contact us on WhatsApp.", 502);
    }
    const handedToAdmin = await saveLivechatExchange(session.id, parsed.data.message, cleanReply);
    const response = NextResponse.json(
      handedToAdmin ? { handoff: true } : { reply: cleanReply },
      { headers: { "Cache-Control": "no-store" } }
    );
    setSessionCookie(response, session.token);
    return response;
  } catch (error) {
    const details = error && typeof error === "object"
      ? error as { name?: unknown; code?: unknown }
      : null;
    console.error("[api/livechat] Request failed", {
      name: typeof details?.name === "string" ? details.name : "UnknownError",
      code: typeof details?.code === "string" ? details.code : "UNKNOWN",
    });
    return responseError("Chat is temporarily unavailable. Please contact us on WhatsApp.", 503);
  }
}
