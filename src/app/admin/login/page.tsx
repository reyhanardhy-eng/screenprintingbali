"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitCredentials(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as { error?: string; stage?: string };
      if (!response.ok) throw new Error(result.error || "Email atau kata sandi salah.");
      if (result.stage === "mfa_setup") router.replace("/admin/security/mfa");
      else if (result.stage === "mfa") setStep("mfa");
      else router.replace("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Tidak dapat masuk.");
    } finally {
      setLoading(false);
    }
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Kode tidak valid.");
      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kode tidak valid.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="admin-page auth-card">
    <h1>Admin sign in</h1>
    <p className="admin-sub">{step === "credentials" ? "Masuk dengan akun admin." : "Masukkan kode authenticator atau recovery code."}</p>
    {error && <p className="admin-status" role="alert">{error}</p>}
    {step === "credentials" ? <form onSubmit={submitCredentials}>
      <div className="auth-field">
        <label className="calc-field__label" htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </div>
      <div className="auth-field">
        <label className="calc-field__label" htmlFor="admin-password">Password</label>
        <PasswordInput value={password} onChange={setPassword} required autoComplete="current-password" />
      </div>
      <button type="submit" className="admin-save-btn" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
      <a className="auth-link" href="/admin/forgot-password">Lupa password?</a>
      <a className="auth-link" href="/admin/setup">Set up the first admin account</a>
    </form> : <form onSubmit={submitCode}>
      <div className="auth-field">
        <label className="calc-field__label" htmlFor="admin-mfa-code">Authenticator or recovery code</label>
        <input id="admin-mfa-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} required maxLength={24} />
      </div>
      <button type="submit" className="admin-save-btn" disabled={loading}>{loading ? "Checking…" : "Verify and continue"}</button>
    </form>}
  </div>;
}
