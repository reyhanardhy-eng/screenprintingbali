"use client";

import { useEffect, useRef, useState } from "react";

type Conversation = {
  id: string;
  humanMode: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastRole: "user" | "assistant" | "admin" | null;
  lastMessage: string | null;
};
type Message = { role: "user" | "assistant" | "admin"; content: string };
type Props = { flash: (message: string) => void };

function shortTime(value: string): string {
  const date = new Date(value.replace(" ", "T") + (value.endsWith("Z") ? "" : "Z"));
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function LivechatInbox({ flash }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [humanMode, setHumanMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/admin/chat", { cache: "no-store" });
        const result = await response.json() as { conversations?: Conversation[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Chat inbox could not be loaded.");
        if (!active) return;
        const next = Array.isArray(result.conversations) ? result.conversations : [];
        setConversations(next);
        if (!selectedId && next[0]) setSelectedId(next[0].id);
        if (selectedId && !next.some((conversation) => conversation.id === selectedId)) {
          setSelectedId(next[0]?.id ?? "");
          setMessages([]);
        }
        setError("");
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Chat inbox could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/admin/chat?sessionId=${encodeURIComponent(selectedId)}`, { cache: "no-store" });
        const result = await response.json() as { conversation?: Conversation; messages?: Message[]; error?: string };
        if (!response.ok) throw new Error(result.error || "This conversation could not be opened.");
        if (!active) return;
        setMessages(Array.isArray(result.messages) ? result.messages : []);
        setHumanMode(result.conversation?.humanMode === true);
        setError("");
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "This conversation could not be opened.");
      }
    };
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function sendAction(action: "reply" | "takeover" | "resume_ai", message?: string) {
    if (!selectedId || sending) return false;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sessionId: selectedId, ...(message ? { message } : {}) }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Your change could not be saved.");
      setHumanMode(action !== "resume_ai");
      flash(action === "reply" ? "Reply sent. AI is paused for this conversation." : action === "takeover" ? "You are now handling this conversation." : "AI replies are active again.");
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your change could not be saved.");
      return false;
    } finally {
      setSending(false);
    }
  }

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || message.length > 2000) return;
    if (await sendAction("reply", message)) setDraft("");
  }

  return (
    <section id="chat-inbox" className="admin-chat-section">
      <div className="admin-chat-heading">
        <div>
          <h2>Live chat inbox</h2>
          <p className="admin-sub">Read customer conversations and reply from here. Sending a reply pauses AI for that conversation.</p>
        </div>
        {selectedId && <span className={`admin-chat-mode ${humanMode ? "is-human" : ""}`}>{humanMode ? "Handled by admin" : "AI is replying"}</span>}
      </div>
      {error && <p className="chat-error" role="alert">{error}</p>}
      <div className="admin-chat-layout">
        <div className="admin-chat-list" aria-label="Customer conversations">
          {loading && conversations.length === 0 && <p className="admin-chat-empty">Loading conversations…</p>}
          {!loading && conversations.length === 0 && <p className="admin-chat-empty">No customer conversations yet.</p>}
          {conversations.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              className={`admin-chat-list-item ${selectedId === conversation.id ? "is-active" : ""}`}
              onClick={() => setSelectedId(conversation.id)}
            >
              <span className="admin-chat-list-copy">
                <strong>Visitor {conversation.id.slice(0, 6).toUpperCase()}</strong>
                <span>{conversation.lastMessage?.replace(/\s+/g, " ").slice(0, 70) || "No message preview"}</span>
                <small>{shortTime(conversation.updatedAt)} · {conversation.humanMode ? "Admin" : "AI"}</small>
              </span>
              {conversation.lastRole === "user" && <span className="chat-unread-dot" aria-label="Latest message from customer" />}
            </button>
          ))}
        </div>
        <div className="admin-chat-thread">
          {!selectedId ? (
            <p className="admin-chat-empty">Select a conversation to read and reply.</p>
          ) : (
            <>
              <div className="admin-chat-thread-top">
                <span>Visitor {selectedId.slice(0, 6).toUpperCase()}</span>
                {humanMode ? (
                  <button className="admin-save-btn" type="button" disabled={sending} onClick={() => void sendAction("resume_ai")}>
                    Resume AI
                  </button>
                ) : (
                  <button className="admin-save-btn" type="button" disabled={sending} onClick={() => void sendAction("takeover")}>
                    Take over
                  </button>
                )}
              </div>
              <div className="chat-messages chat-messages--admin" aria-live="polite" aria-label="Selected conversation">
                {messages.map((message, index) => {
                  const displayRole = message.role === "user" ? "visitor" : message.role;
                  const label = message.role === "user" ? "Customer" : message.role === "admin" ? "You" : "AI";
                  return (
                    <div key={`${index}-${message.role}`} className={`chat-bubble chat-bubble--${displayRole}`}>
                      <span className="admin-chat-message-label">{label}</span>
                      <span>{message.content}</span>
                    </div>
                  );
                })}
                {messages.length === 0 && <p className="admin-chat-empty">No messages in this conversation.</p>}
                <div ref={bottomRef} />
              </div>
              <form className="chat-form" onSubmit={handleSend}>
                <input
                  className="chat-input"
                  aria-label="Reply to customer"
                  placeholder="Write a reply…"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.slice(0, 2000))}
                  maxLength={2000}
                  autoComplete="off"
                />
                <button className="chat-send-btn" type="submit" disabled={sending || !draft.trim()}>
                  {sending ? "Sending…" : "Send reply"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
