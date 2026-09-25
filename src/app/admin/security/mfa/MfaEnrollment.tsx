"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MfaSetup = { qr: string; secret: string };

export default function MfaEnrollment() {
  const router = useRouter();
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/security/mfa", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as MfaSetup & { error?: string };
        if (!response.ok) throw new Error(result.error || "Could not start setup.");
        setSetup(result);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not start setup."));
  }, []);

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/security/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = await response.json() as { error?: string; recovery_codes?: string[] };
      if (!response.ok) throw new Error(result.error || "Could not verify that code.");
      setRecoveryCodes(result.recovery_codes || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not verify that code.");
    } finally { setLoading(false); }
  }

  if (recoveryCodes) return <div className="admin-page auth-card">
    <h1>Save your recovery codes</h1>
    <p className="admin-sub">Each code can be used once if you lose access to your authenticator. Store these somewhere safe. They will not be shown again.</p>
    <ul className="recovery-code-list">{recoveryCodes.map((item) => <li key={item}><code>{item}</code></li>)}</ul>
    <button type="button" className="admin-save-btn" onClick={() => { router.replace("/admin"); router.refresh(); }}>I saved these codes</button>
  </div>;

  return <div className="admin-page auth-card">
    <h1>Protect the admin account</h1>
    <p className="admin-sub">Scan this QR code in an authenticator app, then enter the current six-digit code.</p>
    {error && <p className="admin-status" role="alert">{error}</p>}
    {setup ? <>
      <img className="mfa-qr" src={setup.qr} alt="Authenticator setup QR code" />
      <p className="admin-sub">If scanning is unavailable, enter this key manually:</p>
      <p className="mfa-secret"><code>{setup.secret}</code></p>
      <form onSubmit={verify}>
        <div className="auth-field"><label className="calc-field__label" htmlFor="mfa-code">Authenticator code</label><input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} pattern="[0-9]{6}" maxLength={6} required /></div>
        <button type="submit" className="admin-save-btn" disabled={loading}>{loading ? "Verifying…" : "Enable MFA"}</button>
      </form>
    </> : <p className="admin-sub">Preparing setup…</p>}
  </div>;
}
