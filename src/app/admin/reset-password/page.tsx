"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const hashError = hash.get("error_description");
    if (hashError) {
      const message = decodeURIComponent(hashError.replace(/\+/g, " "));
      queueMicrotask(() => {
        setLinkError(message);
        setReady(true);
      });
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // If a session already exists from the recovery link by the time this runs.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const timeout = setTimeout(() => setReady(true), 2500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="admin-page" style={{ maxWidth: 400 }}>
      <h1>Set password baru</h1>

      {!ready && <p className="admin-sub">Memeriksa link…</p>}

      {ready && linkError && (
        <>
          <p className="admin-status">
            Link tidak valid atau sudah kedaluwarsa: {linkError}
          </p>
          <p className="admin-sub">
            Minta link reset baru dari Supabase Dashboard (Authentication → Users →
            pilih user → Send password recovery), lalu klik link yang terbaru.
          </p>
        </>
      )}

      {ready && !linkError && !done && (
        <form onSubmit={handleSubmit}>
          <p className="admin-sub">Masukkan password baru untuk akun admin.</p>
          {error && <p className="admin-status">{error}</p>}
          <div style={{ marginBottom: 16 }}>
            <label className="calc-field__label">Password baru</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              required
              minLength={8}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--rule)",
                background: "var(--paper-light)",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="calc-field__label">Konfirmasi password</label>
            <PasswordInput
              value={confirm}
              onChange={setConfirm}
              required
              minLength={8}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--rule)",
                background: "var(--paper-light)",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>
          <button type="submit" className="admin-save-btn" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan password"}
          </button>
        </form>
      )}

      {done && <p className="admin-status">Password tersimpan. Mengarahkan ke /admin…</p>}
    </div>
  );
}
