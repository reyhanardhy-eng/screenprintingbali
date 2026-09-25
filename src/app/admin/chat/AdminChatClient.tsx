"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, Conversation } from "@/lib/chat";

type ConversationRow = Conversation & { unread_count: number };

export default function AdminChatClient() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [sendError, setSendError] = useState("");
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadConversations = useCallback(async () => {
    const response = await fetch("/api/chat", { cache: "no-store" });
    if (!response.ok) return;
    const result = await response.json() as { conversations: ConversationRow[] };
    setConversations(result.conversations ?? []);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    const response = await fetch(`/api/chat?conversationId=${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) return;
    const result = await response.json() as { messages: ChatMessage[] };
    setMessages(result.messages ?? []);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadConversations();
      if (typeof window !== "undefined" && "Notification" in window) {
        setNotifPermission(Notification.permission);
      } else {
        setNotifPermission("unsupported");
      }
    });
  }, [loadConversations]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      loadConversations();
      if (activeIdRef.current) loadMessages(activeIdRef.current);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadConversations, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function openConversation(id: string) {
    setActiveId(id);
    await loadMessages(id);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", conversationId: id }),
    });
    loadConversations();
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !body.trim()) return;
    const text = body.trim();
    setSendError("");
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", conversationId: activeId, body: text }),
    });
    if (!response.ok) {
      setSendError("Gagal mengirim pesan. Coba lagi.");
      return;
    }
    const result = await response.json() as { message: ChatMessage };
    if (result.message) {
      setMessages((prev) => (prev.some((m) => m.id === result.message.id) ? prev : [...prev, result.message]));
    }
    setBody("");
    loadConversations();
  }

  async function requestNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  }

  const unreadCount = conversations.filter((c) => c.unread_count > 0).length;

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>
          Live chat {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount}</span>}
        </h1>
        <a href="/admin" className="admin-sub" style={{ textDecoration: "underline" }}>
          ← Pricing admin
        </a>
      </div>

      {notifPermission === "default" && (
        <p className="admin-status" style={{ cursor: "pointer" }} onClick={requestNotifications}>
          Aktifkan notifikasi browser untuk chat masuk →
        </p>
      )}

      <div className="admin-chat-layout">
        <div className="admin-chat-list">
          {conversations.length === 0 && <p className="admin-sub">Belum ada percakapan.</p>}
          {conversations.map((c) => (
            <button
              key={c.id}
              className={`admin-chat-list-item${activeId === c.id ? " is-active" : ""}`}
              onClick={() => openConversation(c.id)}
            >
              <span>{c.visitor_email ?? c.visitor_id.slice(0, 8)}</span>
              {c.unread_count > 0 && <span className="chat-unread-dot" />}
            </button>
          ))}
        </div>

        <div className="admin-chat-thread">
          {!activeId ? (
            <p className="admin-sub">Pilih percakapan di sebelah kiri.</p>
          ) : (
            <>
              <div className="chat-messages chat-messages--admin">
                {messages.map((m) => (
                  <div key={m.id} className={`chat-bubble chat-bubble--${m.sender}`}>
                    {m.body}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              {sendError && (
                <p className="chat-error" role="alert">
                  {sendError}
                </p>
              )}
              <form onSubmit={sendReply} className="chat-form">
                <input
                  className="chat-input"
                  placeholder="Balas pesan…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <button type="submit" className="chat-send-btn">
                  Kirim
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
