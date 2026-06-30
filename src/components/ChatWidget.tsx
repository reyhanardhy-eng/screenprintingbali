"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, Conversation } from "@/lib/chat";

type AuthMode = "signin" | "signup";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup chat" : "Buka chat"}
      >
        {open ? "×" : "Chat"}
      </button>
      {open && (
        <div className="chat-panel">
          {checkingAuth ? (
            <p className="chat-sub">Memuat…</p>
          ) : user ? (
            <ChatThread user={user} />
          ) : (
            <ChatAuth />
          )}
        </div>
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
      setInfo("Cek email kamu untuk konfirmasi akun, lalu login di sini.");
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
        {mode === "signin" ? "Masuk untuk mulai chat" : "Daftar untuk mulai chat"}
      </p>
      <p className="chat-sub">Daftar atau masuk dulu untuk chat langsung dengan kami.</p>

      <button type="button" className="chat-google-btn" onClick={handleGoogle}>
        Lanjutkan dengan Google
      </button>

      <div className="chat-divider">atau pakai email</div>

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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn" disabled={loading}>
          {loading ? "Memproses..." : mode === "signin" ? "Masuk" : "Daftar"}
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
        {mode === "signin" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
      </button>
    </div>
  );
}

function ChatThread({ user }: { user: User }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .eq("visitor_id", user.id)
        .maybeSingle<Conversation>();

      let conv = existing;
      if (!conv) {
        const { data: created, error } = await supabase
          .from("conversations")
          .insert({ visitor_id: user.id, visitor_email: user.email })
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

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at");

      if (!cancelled) {
        setMessages((msgs as ChatMessage[]) ?? []);
        setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [user.id, user.email]);

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
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!conversationId || !body.trim()) return;
      const supabase = createClient();
      const text = body.trim();
      setBody("");
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender: "visitor",
        sender_id: user.id,
        body: text,
      });
    },
    [conversationId, body, user.id]
  );

  if (loading) {
    return <p className="chat-sub">Memuat percakapan…</p>;
  }

  return (
    <div className="chat-thread">
      <p className="chat-title">Live chat</p>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-sub">Tulis pesan kamu, kami akan balas secepatnya.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble chat-bubble--${m.sender}`}>
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input
          className="chat-input"
          placeholder="Tulis pesan…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button type="submit" className="chat-send-btn">
          Kirim
        </button>
      </form>
    </div>
  );
}
