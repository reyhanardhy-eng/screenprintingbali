"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export default function AdminSetupPage() {
  const router = useRouter();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/setup", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { available?: boolean };
        setAvailable(response.ok && result.available === true);
      })
      .catch(() => setAvailable(false));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, full_name: name, password }),
      });
      const result = await response.json() as { error?: string; next?: string };
      if (!response.ok) throw new Error(result.error || "Could not create the admin account.");
      router.replace(result.next || "/admin/security/mfa");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the admin account.");
    } finally { setLoading(false); }
  }

  return <div className="admin-page auth-card">
    <h1>Initial admin setup</h1>
    {available === null ? <p className="admin-sub">Checking setup…</p> : !available ? <p className="admin-status">Admin setup is unavailable. Check the database and Hostinger setup token, or sign in.</p> : <>
      <p className="admin-sub">Create the first admin account. Admins must enable an authenticator before opening the dashboard.</p>
      {error && <p className="admin-status" role="alert">{error}</p>}
      <form onSubmit={submit}>
        <div className="auth-field"><label className="calc-field__label" htmlFor="bootstrap-token">One-time setup token</label><PasswordInput value={token} onChange={setToken} required minLength={32} autoComplete="off" /></div>
        <div className="auth-field"><label className="calc-field__label" htmlFor="bootstrap-name">Name</label><input id="bootstrap-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} autoComplete="name" /></div>
        <div className="auth-field"><label className="calc-field__label" htmlFor="bootstrap-email">Admin email</label><input id="bootstrap-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} autoComplete="email" /></div>
        <div className="auth-field"><label className="calc-field__label" htmlFor="bootstrap-password">Password (12 characters or more)</label><PasswordInput value={password} onChange={setPassword} required minLength={12} autoComplete="new-password" /></div>
        <button type="submit" className="admin-save-btn" disabled={loading}>{loading ? "Creating…" : "Create admin"}</button>
      </form>
    </>}
    <a className="auth-link" href="/admin/login">Back to sign in</a>
  </div>;
}
