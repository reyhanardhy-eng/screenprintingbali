"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not request a reset link.");
      setMessage(result.message || "If an account matches, a reset link will arrive shortly.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not request a reset link."); }
    finally { setLoading(false); }
  }

  return <div className="admin-page auth-card">
    <h1>Admin password recovery</h1>
    <p className="admin-sub">Masukkan email admin. Jika cocok, tautan pemulihan sekali pakai akan dikirim.</p>
    {message && <p className="admin-status" role="status">{message}</p>}
    {error && <p className="admin-status" role="alert">{error}</p>}
    <form onSubmit={submit}>
      <div className="auth-field"><label className="calc-field__label" htmlFor="reset-email">Email</label><input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
      <button className="admin-save-btn" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button>
    </form>
    <a className="auth-link" href="/admin/login">Back to sign in</a>
  </div>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!token) { setError("This reset link is missing or invalid."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "This link may have expired.");
      setDone(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not reset password."); }
    finally { setLoading(false); }
  }

  return <div className="admin-page auth-card">
    <h1>Choose a new password</h1>
    {error && <p className="admin-status" role="alert">{error}</p>}
    {done ? <>
      <p className="admin-status">Password updated. Sign in with the new password.</p>
      <button className="admin-save-btn" onClick={() => router.replace("/admin/login")}>Go to sign in</button>
    </> : <form onSubmit={submit}>
      <p className="admin-sub">Use at least 12 characters. Active sessions will be signed out.</p>
      <div className="auth-field"><label className="calc-field__label" htmlFor="new-password">New password</label><PasswordInput id="new-password" value={password} onChange={setPassword} required minLength={12} maxLength={128} autoComplete="new-password" /></div>
      <div className="auth-field"><label className="calc-field__label" htmlFor="confirm-password">Confirm password</label><PasswordInput id="confirm-password" value={confirm} onChange={setConfirm} required minLength={12} maxLength={128} autoComplete="new-password" /></div>
      <button className="admin-save-btn" disabled={loading}>{loading ? "Saving…" : "Set new password"}</button>
    </form>}
    <a className="auth-link" href="/admin/login">Back to sign in</a>
  </div>;
}
