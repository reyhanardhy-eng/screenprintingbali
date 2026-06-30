"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, Conversation } from "@/lib/chat";

type ConversationRow = Conversation & { unread: boolean };

export default function AdminChatPage() {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadConversations = useCallback(async () => {
    const supabase = createClient();
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (!convs) return;

    const { data: unreadMsgs } = await supabase
      .from("messages")
      .select("conversation_id")
      .eq("read_by_admin", false);

    const unreadSet = new Set((unreadMsgs ?? []).map((m) => m.conversation_id as string));
    setConversations(
      (convs as Conversation[]).map((c) => ({ ...c, unread: unreadSet.has(c.id) }))
    );
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAdminUser(data.user));

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
    const supabase = createClient();
    const channel = supabase
      .channel("admin-chat-all")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (msg.conversation_id === activeIdRef.current) {
            setMessages((prev) => [...prev, msg]);
          }
          loadConversations();
          if (msg.sender === "visitor" && notifPermission === "granted") {
            new Notification("Pesan baru di live chat", { body: msg.body });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadConversations, notifPermission]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function openConversation(id: string) {
    setActiveId(id);
    const supabase = createClient();
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at");
    setMessages((msgs as ChatMessage[]) ?? []);

    await supabase
      .from("messages")
      .update({ read_by_admin: true })
      .eq("conversation_id", id)
      .eq("read_by_admin", false);
    loadConversations();
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !body.trim() || !adminUser) return;
    const supabase = createClient();
    const text = body.trim();
    setBody("");
    await supabase.from("messages").insert({
      conversation_id: activeId,
      sender: "admin",
      sender_id: adminUser.id,
      body: text,
    });
  }

  async function requestNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  }

  const unreadCount = conversations.filter((c) => c.unread).length;

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
              {c.unread && <span className="chat-unread-dot" />}
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
