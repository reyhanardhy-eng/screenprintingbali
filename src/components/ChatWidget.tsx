"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Auth and conversation state is synchronized from the session/chat API after mount. */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatPrincipal } from "@/lib/auth-types";
import type { ChatMessage } from "@/lib/chat";
import PasswordInput from "@/components/PasswordInput";

type AuthMode = "signin" | "signup" | "forgot";

function useChatThread(user: ChatPrincipal | null) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async (id?: string) => {
    const query = id ? `?conversationId=${encodeURIComponent(id)}` : "";
    const response = await fetch(`/api/chat${query}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load this conversation.");
    const result = await response.json() as { conversation?: { id: string } | null; messages: ChatMessage[] };
    const nextId = id ?? result.conversation?.id ?? null;
    setConversationId(nextId);
    setMessages(result.messages ?? []);
    return nextId;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setConversationId(null);
    setMessages([]);
    if (!user) {
      setLoading(false);
      return;
    }

    async function init() {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start" }),
        });
        if (!response.ok) throw new Error("Could not start chat.");
        const result = await response.json() as { conversationId: string };
        if (cancelled) return;
        const id = await refresh(result.conversationId);
        if (!cancelled && id) setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Chat is temporarily unavailable. Please try again later.");
          setLoading(false);
        }
      }
    }
    void init();
    return () => { cancelled = true; };
  }, [user, refresh]);

  useEffect(() => {
    if (!conversationId) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh(conversationId);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [conversationId, refresh]);

  const sendMessage = useCallback(async (text: string) => {
    if (!conversationId || !text.trim()) return false;
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", conversationId, body: text.trim() }),
    });
    if (!response.ok) return false;
    const result = await response.json() as { message: ChatMessage };
    setMessages((previous) => previous.some((message) => message.id === result.message.id) ? previous : [...previous, result.message]);
    return true;
  }, [conversationId]);

  const markRead = useCallback(async () => {
    if (!conversationId || !messages.some((message) => message.sender === "admin" && !message.read_by_visitor)) return;
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", conversationId }),
    });
    setMessages((previous) => previous.map((message) => message.sender === "admin" ? { ...message, read_by_visitor: true } : message));
  }, [conversationId, messages]);

  const unreadCount = messages.filter((message) => message.sender === "admin" && !message.read_by_visitor).length;
  return { conversationId, messages, loading, error, sendMessage, markRead, unreadCount };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<ChatPrincipal | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showTeaser, setShowTeaser] = useState(false);
  const thread = useChatThread(user);
  const markThreadRead = thread.markRead;
  const unreadCount = thread.unreadCount;

  const refreshUser = useCallback(async () => {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const data = await response.json() as { user: ChatPrincipal | null };
    setUser(data.user?.role === "customer" ? data.user : null);
    setCheckingAuth(false);
  }, []);

  useEffect(() => { void refreshUser(); }, [refreshUser]);
  useEffect(() => {
    const timer = setTimeout(() => setShowTeaser(true), 4000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { if (open) void markThreadRead(); }, [open, unreadCount, markThreadRead]);

  function handleOpen() {
    setOpen((value) => !value);
    setShowTeaser(false);
  }

  return (
    <>
      {showTeaser && !open && (
        <div className="chat-teaser" onClick={handleOpen}>
          <button className="chat-teaser__close" aria-label="Dismiss" onClick={(event) => { event.stopPropagation(); setShowTeaser(false); }}>×</button>
          Got a question? We usually reply within minutes.
        </div>
      )}
      <button className="chat-fab" onClick={handleOpen} aria-label={open ? "Close chat" : "Open chat"}>
        {open ? <span className="chat-fab__icon">×</span> : <>
          <span className="chat-fab__ping" />
          <span className="chat-fab__icon">💬{thread.unreadCount > 0 && <span className="chat-fab__unread">{thread.unreadCount}</span>}</span>
          <span className="chat-fab__label">Chat with us</span>
        </>}
      </button>
      {open && <>
        <div className="chat-backdrop" onClick={() => setOpen(false)} />
        <div className="chat-panel">
          {checkingAuth ? <p className="chat-sub">Loading…</p> : user ? <ChatThreadView thread={thread} /> : <ChatAuth onAuthenticated={refreshUser} />}
        </div>
      </>}
    </>
  );
}

function ChatAuth({ onAuthenticated }: { onAuthenticated: () => Promise<void> }) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : mode === "forgot" ? "/api/auth/forgot-password" : "/api/auth/login";
      const payload = mode === "forgot" ? { email } : { email, password };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string; message?: string; stage?: string };
      if (!response.ok) throw new Error(result.error || "Unable to complete that request.");
      if (mode === "signup" || mode === "forgot") setInfo(result.message || "Check your email for the next step.");
      else {
        await onAuthenticated();
        setInfo("You’re signed in. You can start chatting now.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to complete that request.");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "signin" ? "Sign in to start chatting" : mode === "signup" ? "Sign up to start chatting" : "Reset your password";
  return <div>
      <p className="chat-title">{title}</p>
    <p className="chat-sub">{mode === "forgot" ? "We’ll email a one-time reset link if an account matches." : "Sign up or sign in first so we know who we’re talking to."}</p>
    {error && <p className="chat-error">{error}</p>}
    {info && <p className="chat-info">{info}</p>}
    {mode === "signin" && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && <a className="chat-google-btn" href="/api/auth/google/start">Continue with Google</a>}
    <form onSubmit={handleSubmit}>
      <input type="email" autoComplete="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required className="chat-input" />
      {mode !== "forgot" && <PasswordInput placeholder="Password (12 characters or more)" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={setPassword} required minLength={mode === "signup" ? 12 : 1} maxLength={128} className="chat-input" />}
      <button type="submit" className="chat-send-btn" disabled={loading}>{loading ? "Please wait…" : mode === "signup" ? "Sign up" : mode === "forgot" ? "Send reset link" : "Sign in"}</button>
    </form>
    <div className="chat-auth-links">
      {mode === "signin" && <button type="button" className="chat-switch-btn" onClick={() => { setMode("forgot"); setError(""); setInfo(""); }}>Forgot password?</button>}
      <button type="button" className="chat-switch-btn" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); setInfo(""); }}>
        {mode === "signup" ? "Already have an account? Sign in" : "Don’t have an account? Sign up"}
      </button>
    </div>
  </div>;
}

function ChatThreadView({ thread }: { thread: ReturnType<typeof useChatThread> }) {
  const { messages, loading, error, sendMessage } = thread;
  const [body, setBody] = useState("");
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    const sent = await sendMessage(body);
    if (sent) { setBody(""); setSendError(""); }
    else setSendError("Message could not be sent. Please try again.");
  }

  if (loading) return <p className="chat-sub">Loading conversation…</p>;
  if (error) return <p className="chat-error">{error}</p>;
  return <div className="chat-thread">
    <p className="chat-title">Live chat</p>
    <div className="chat-messages">
      {messages.length === 0 && <p className="chat-sub">Write your message, we’ll reply as soon as we can.</p>}
      {messages.map((message) => <div key={message.id} className={`chat-bubble chat-bubble--${message.sender}`}>{message.body}</div>)}
      <div ref={bottomRef} />
    </div>
    {sendError && <p className="chat-error" role="alert">{sendError}</p>}
    <form onSubmit={handleSubmit} className="chat-form">
      <input className="chat-input" placeholder="Write a message…" value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} />
      <button type="submit" className="chat-send-btn">Send</button>
    </form>
  </div>;
}
