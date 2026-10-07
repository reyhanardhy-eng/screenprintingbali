"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import { readRememberedAdminEmail, rememberAdminEmail } from "@/lib/remembered-admin-email";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = readRememberedAdminEmail();
    setEmail(saved);
    setRememberEmail(Boolean(saved));
  }, []);

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
      if (!response.ok) throw new Error(result.error || "Email or password is incorrect.");
      rememberAdminEmail(email, rememberEmail);
      if (result.stage === "mfa_setup") router.replace("/admin/security/mfa");
      else if (result.stage === "mfa") setStep("mfa");
      else router.replace("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
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
      if (!response.ok) throw new Error(result.error || "The code is invalid.");
      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The code is invalid.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="admin-page auth-card">
    <h1>Admin sign in</h1>
    <p className="admin-sub">{step === "credentials" ? "Sign in with your admin account." : "Enter your authenticator or recovery code."}</p>
    {error && <p className="admin-status" role="alert">{error}</p>}
    {step === "credentials" ? <form onSubmit={submitCredentials}>
      <div className="auth-field">
        <label className="calc-field__label" htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </div>
      <div className="auth-field">
        <label className="calc-field__label" htmlFor="admin-password">Password</label>
        <PasswordInput id="admin-password" value={password} onChange={setPassword} required autoComplete="current-password" />
      </div>
      <label className="auth-remember"><input type="checkbox" checked={rememberEmail} onChange={(event) => {
        setRememberEmail(event.target.checked);
        if (!event.target.checked) rememberAdminEmail("", false);
      }} /> Remember my email on this device</label>
      <p className="admin-sub">Use this on your own device. Your password is never saved here.</p>
      <button type="submit" className="admin-save-btn" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
      <a className="auth-link" href="/admin/forgot-password">Forgot password?</a>
    </form> : <form onSubmit={submitCode}>
      <div className="auth-field">
        <label className="calc-field__label" htmlFor="admin-mfa-code">Authenticator or recovery code</label>
        <input id="admin-mfa-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} required maxLength={24} />
      </div>
      <button type="submit" className="admin-save-btn" disabled={loading}>{loading ? "Checking…" : "Verify and continue"}</button>
    </form>}
  </div>;
}
