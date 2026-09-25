"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Widget availability and chat history are synchronized with the live API after mount. */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LIVECHAT_WIDGET } from "@/lib/livechat-shared";

type ChatMessage = { role: "user" | "assistant"; content: string };
type WidgetSettings = {
  title: string;
  subtitle: string;
  welcome: string;
  privacyNote: string;
  buttonLabel: string;
  whatsappUrl: string;
};

export default function AIChatWidget() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [widget, setWidget] = useState<WidgetSettings>(DEFAULT_LIVECHAT_WIDGET);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    fetch("/api/livechat", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as Partial<WidgetSettings> & { enabled?: boolean };
        setWidget({
          title: result.title ?? DEFAULT_LIVECHAT_WIDGET.title,
          subtitle: result.subtitle ?? DEFAULT_LIVECHAT_WIDGET.subtitle,
          welcome: result.welcome ?? DEFAULT_LIVECHAT_WIDGET.welcome,
          privacyNote: result.privacyNote ?? DEFAULT_LIVECHAT_WIDGET.privacyNote,
          buttonLabel: result.buttonLabel ?? DEFAULT_LIVECHAT_WIDGET.buttonLabel,
          whatsappUrl: result.whatsappUrl ?? DEFAULT_LIVECHAT_WIDGET.whatsappUrl,
        });
        setEnabled(result.enabled === true);
      })
      .catch(() => setEnabled(false));
  }, [pathname]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending || content.length > 2000) return;

    const userMessage: ChatMessage = { role: "user", content };
    const nextMessages = [...messages, userMessage].slice(-12);
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setSending(true);
    try {
      const response = await fetch("/api/livechat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const result = await response.json() as { reply?: string; error?: string };
      if (!response.ok || !result.reply) throw new Error(result.error || "Chat sedang tidak tersedia.");
      const assistantMessage: ChatMessage = { role: "assistant", content: result.reply };
      setMessages([...nextMessages, assistantMessage].slice(-12));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chat sedang tidak tersedia.");
    } finally {
      setSending(false);
    }
  }

  if (!enabled || pathname.startsWith("/admin")) return null;

  return <>
    {open && <>
      <div className="chat-backdrop" onClick={() => setOpen(false)} />
      <section className="chat-panel" role="dialog" aria-label="Screenprinting Bali AI chat">
        <div className="chat-panel__header">
          <div>
            <p className="chat-title">{widget.title}</p>
            <p className="chat-sub">{widget.subtitle}</p>
          </div>
          <button className="chat-panel__close" type="button" aria-label="Close chat" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="chat-messages" aria-live="polite" aria-label="Chat messages">
          {messages.length === 0 && <p className="chat-sub">{widget.welcome}</p>}
          {messages.map((message, index) => (
            <div key={`${index}-${message.role}`} className={`chat-bubble chat-bubble--${message.role}`}>
              {message.content}
            </div>
          ))}
          {sending && <p className="chat-sub" role="status">Thinking…</p>}
          <div ref={bottomRef} />
        </div>
        {error && <p className="chat-error" role="alert">{error}</p>}
        <p className="chat-privacy-note">{widget.privacyNote}</p>
        <form onSubmit={send} className="chat-form">
          <input
            className="chat-input"
            aria-label="Your message"
            placeholder="Write a message…"
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 2000))}
            maxLength={2000}
            autoComplete="off"
          />
          <button type="submit" className="chat-send-btn" disabled={sending || !draft.trim()}>
            {sending ? "…" : "Send"}
          </button>
        </form>
        <a className="chat-whatsapp-link" href={widget.whatsappUrl} target="_blank" rel="noreferrer">
          Message the team on WhatsApp →
        </a>
      </section>
    </>}
    <button className="chat-fab" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close AI chat" : "Open AI chat"}>
      <span className="chat-fab__icon">{open ? "×" : "✳"}</span>
      <span className="chat-fab__label">{widget.buttonLabel}</span>
    </button>
  </>;
}
