"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, Conversation } from "@/lib/chat";
import PasswordInput from "@/components/PasswordInput";

type AuthMode = "signin" | "signup";

function useChatThread(user: User | null) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async (convId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at");
    if (data) setMessages(data as ChatMessage[]);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function init() {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .eq("visitor_id", user!.id)
        .maybeSingle<Conversation>();

      let conv = existing;
      if (!conv) {
        const { data: created, error } = await supabase
          .from("conversations")
          .insert({ visitor_id: user!.id, visitor_email: user!.email })
          .select("*")
          .single<Conversation>();
        if (error) {
          setLoading(false);
          return;
        }
        conv = created;
      }

      if (cancelled || !conv) return;
      setConversationId(conv.id);
      await fetchMessages(conv.id);
      if (!cancelled) setLoading(false);
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [user, fetchMessages]);

  // Realtime: instant delivery when the socket is healthy.
  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-visitor-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Polling fallback so messages still arrive even if the realtime socket
  // drops (mobile networks, tab backgrounded, etc.) without needing a manual refresh.
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchMessages(conversationId);
    }, 4000);
    return () => clearInterval(interval);
  }, [conversationId, fetchMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !user || !text.trim()) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender: "visitor",
          sender_id: user.id,
          body: text.trim(),
        })
        .select("*")
        .single<ChatMessage>();
      if (data) {
        setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      }
    },
    [conversationId, user]
  );

  const markRead = useCallback(async () => {
    if (!conversationId) return;
    const hasUnread = messages.some((m) => m.sender === "admin" && !m.read_by_visitor);
    if (!hasUnread) return;
    const supabase = createClient();
    await supabase
      .from("messages")
      .update({ read_by_visitor: true })
      .eq("conversation_id", conversationId)
      .eq("read_by_visitor", false);
    setMessages((prev) =>
      prev.map((m) => (m.sender === "admin" ? { ...m, read_by_visitor: true } : m))
    );
  }, [conversationId, messages]);

  const unreadCount = messages.filter((m) => m.sender === "admin" && !m.read_by_visitor).length;

  return { conversationId, messages, loading, sendMessage, markRead, unreadCount };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showTeaser, setShowTeaser] = useState(false);
  const thread = useChatThread(user);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCheckingAuth(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowTeaser(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open) thread.markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, thread.unreadCount]);

  function handleOpen() {
    setOpen((v) => !v);
    setShowTeaser(false);
  }

  return (
    <>
      {showTeaser && !open && (
        <div className="chat-teaser" onClick={handleOpen}>
          <button
            className="chat-teaser__close"
            aria-label="Dismiss"
            onClick={(e) => {
              e.stopPropagation();
              setShowTeaser(false);
            }}
          >
            ×
          </button>
          Got a question? We usually reply within minutes.
        </div>
      )}
      <button
        className="chat-fab"
        onClick={handleOpen}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <span className="chat-fab__icon">×</span>
        ) : (
          <>
            <span className="chat-fab__ping" />
            <span className="chat-fab__icon">
              💬
              {thread.unreadCount > 0 && (
                <span className="chat-fab__unread">{thread.unreadCount}</span>
              )}
            </span>
            <span className="chat-fab__label">Chat with us</span>
          </>
        )}
      </button>
      {open && (
        <>
          <div className="chat-backdrop" onClick={() => setOpen(false)} />
          <div className="chat-panel">
            {checkingAuth ? (
              <p className="chat-sub">Loading…</p>
            ) : user ? (
              <ChatThreadView thread={thread} />
            ) : (
              <ChatAuth />
            )}
          </div>
        </>
      )}
    </>
  );
}

function ChatAuth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setInfo("Check your email to confirm your account, then sign in here.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    }
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div>
      <p className="chat-title">
        {mode === "signin" ? "Sign in to start chatting" : "Sign up to start chatting"}
      </p>
      <p className="chat-sub">Sign up or sign in first so we know who we&apos;re talking to.</p>

      <button type="button" className="chat-google-btn" onClick={handleGoogle}>
        Continue with Google
      </button>

      <div className="chat-divider">or use email</div>

      {error && <p className="chat-error">{error}</p>}
      {info && <p className="chat-info">{info}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="chat-input"
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn" disabled={loading}>
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <button
        type="button"
        className="chat-switch-btn"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError("");
          setInfo("");
        }}
      >
        {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

function ChatThreadView({ thread }: { thread: ReturnType<typeof useChatThread> }) {
  const { messages, loading, sendMessage } = thread;
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!body.trim()) return;
      const text = body.trim();
      setBody("");
      await sendMessage(text);
    },
    [body, sendMessage]
  );

  if (loading) {
    return <p className="chat-sub">Loading conversation…</p>;
  }

  return (
    <div className="chat-thread">
      <p className="chat-title">Live chat</p>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-sub">Write your message, we&apos;ll reply as soon as we can.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble chat-bubble--${m.sender}`}>
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          className="chat-input"
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button type="submit" className="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
}
