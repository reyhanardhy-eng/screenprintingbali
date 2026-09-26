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

function sameMessages(left: Message[], right: Message[]): boolean {
  return left.length === right.length && left.every((message, index) =>
    message.role === right[index].role && message.content === right[index].content
  );
}

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
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);
  const followLatestRef = useRef(true);

  useEffect(() => {
    let active = true;
    let refreshing = false;
    const refresh = async () => {
      if (!active || refreshing) return;
      refreshing = true;
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
        refreshing = false;
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
    followLatestRef.current = true;
    if (!selectedId) return;
    let active = true;
    let refreshing = false;
    const refresh = async () => {
      if (!active || refreshing) return;
      refreshing = true;
      try {
        const response = await fetch(`/api/admin/chat?sessionId=${encodeURIComponent(selectedId)}`, { cache: "no-store" });
        const result = await response.json() as { conversation?: Conversation; messages?: Message[]; error?: string };
        if (!response.ok) throw new Error(result.error || "This conversation could not be opened.");
        if (!active) return;
        const nextMessages = Array.isArray(result.messages) ? result.messages : [];
        setMessages((current) => sameMessages(current, nextMessages) ? current : nextMessages);
        setHumanMode(result.conversation?.humanMode === true);
        setError("");
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "This conversation could not be opened.");
      } finally {
        refreshing = false;
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
    if (!followLatestRef.current) return;
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
    followLatestRef.current = false;
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

  async function handleDeleteConversation() {
    if (!selectedId || deleting) return;
    const confirmed = window.confirm(
      "Permanently delete this chat room and all of its saved messages? This cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedId }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "This conversation could not be deleted.");

      const remaining = conversations.filter((conversation) => conversation.id !== selectedId);
      setConversations(remaining);
      setMessages([]);
      setSelectedId(remaining[0]?.id ?? "");
      setHumanMode(false);
      flash("Chat room and saved messages deleted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "This conversation could not be deleted.");
    } finally {
      setDeleting(false);
    }
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
              onClick={() => {
                setMessages([]);
                setSelectedId(conversation.id);
              }}
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
                <div className="admin-chat-thread-actions">
                  {humanMode ? (
                    <button className="admin-save-btn" type="button" disabled={sending || deleting} onClick={() => void sendAction("resume_ai")}>
                      Resume AI
                    </button>
                  ) : (
                    <button className="admin-save-btn" type="button" disabled={sending || deleting} onClick={() => void sendAction("takeover")}>
                      Take over
                    </button>
                  )}
                  <button
                    className="admin-chat-delete"
                    type="button"
                    disabled={deleting || sending}
                    onClick={() => void handleDeleteConversation()}
                  >
                    {deleting ? "Deleting…" : "Delete chat"}
                  </button>
                </div>
              </div>
              <div
                ref={messageListRef}
                className="chat-messages chat-messages--admin"
                aria-live="polite"
                aria-label="Selected conversation"
                onScroll={(event) => {
                  const list = event.currentTarget;
                  followLatestRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 64;
                }}
              >
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

