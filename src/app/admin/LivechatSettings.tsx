"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_LIVECHAT_WIDGET,
  type LivechatAdminSettings,
  type LivechatApiKeySource,
} from "@/lib/livechat-shared";

type Props = { flash: (message: string) => void };

export default function LivechatSettings({ flash }: Props) {
  const [settings, setSettings] = useState<LivechatAdminSettings | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/livechat", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as LivechatAdminSettings & { error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load chatbot settings.");
        setSettings(result);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load chatbot settings."))
      .finally(() => setLoading(false));
  }, []);

  function update(patch: Partial<LivechatAdminSettings>) {
    setSettings((current) => current ? { ...current, ...patch } : current);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/livechat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: settings.enabled,
          model: settings.model,
          systemPrompt: settings.systemPrompt,
          apiKeySource: settings.apiKeySource,
          apiKey: apiKey.trim() || undefined,
          title: settings.title,
          subtitle: settings.subtitle,
          welcome: settings.welcome,
          privacyNote: settings.privacyNote,
          buttonLabel: settings.buttonLabel,
          whatsappUrl: settings.whatsappUrl,
        }),
      });
      const result = await response.json() as {
        settings?: LivechatAdminSettings;
        error?: string;
      };
      if (!response.ok || !result.settings) {
        throw new Error(result.error || "Could not save chatbot settings.");
      }
      setSettings(result.settings);
      setApiKey("");
      flash("Chatbot settings saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save chatbot settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section id="chatbot-settings" className="admin-settings-section"><p className="admin-sub">Loading chatbot settings…</p></section>;
  }

  if (!settings) {
    return (
      <section id="chatbot-settings" className="admin-settings-section">
        <h2>AI chatbot &amp; API</h2>
        <p className="admin-settings-error" role="alert">{error || "Settings are unavailable."}</p>
        <p className="admin-settings-help">Make sure the Hostinger database is connected and the app can access its settings table.</p>
      </section>
    );
  }

  const keySourceLabel = settings.apiKeySource === "database"
    ? "Stored encrypted in the Hostinger database"
    : settings.apiKeySource === "environment"
      ? "Using the Hostinger ZROUTER_API_KEY environment variable"
      : "API key is disabled";

  return (
    <section id="chatbot-settings" className="admin-settings-section">
      <div className="admin-settings-heading">
        <div>
          <span className="eyebrow">Integrations &amp; content</span>
          <h2>AI chatbot &amp; API</h2>
          <p className="admin-settings-help">Configure ZRouter, bot behavior, chat widget text, and the WhatsApp link. Changes apply to the website immediately.</p>
        </div>
        <span className={`admin-settings-pill${settings.enabled && settings.apiKeyConfigured ? " is-on" : ""}`}>
          {settings.enabled && settings.apiKeyConfigured ? "Bot active" : "Bot inactive"}
        </span>
      </div>

      {error && <p className="admin-settings-error" role="alert">{error}</p>}

      <form className="admin-settings-form" onSubmit={save}>
        <div className="admin-settings-card">
          <div className="admin-settings-card__heading">
            <h3>Koneksi API</h3>
            <label className="admin-settings-toggle">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(event) => update({ enabled: event.target.checked })}
              />
              <span>Enable the public chatbot</span>
            </label>
          </div>

          <label className="admin-settings-field">
            <span>Provider and endpoint</span>
            <input value="ZRouter · https://api.zrouter.dev/v1/chat/completions" readOnly />
            <small>The endpoint is fixed on the server to prevent misuse. The API key is never sent to visitors.</small>
          </label>

          <label className="admin-settings-field">
            <span>Model</span>
            <input
              value={settings.model}
              onChange={(event) => update({ model: event.target.value })}
              maxLength={120}
              required
              autoComplete="off"
              placeholder="gpt-5.4"
            />
          </label>

          <label className="admin-settings-field">
            <span>API key source</span>
            <select
              value={settings.apiKeySource}
              onChange={(event) => {
                const apiKeySource = event.target.value as LivechatApiKeySource;
                update({ apiKeySource, ...(apiKeySource === "disabled" ? { enabled: false } : {}) });
              }}
            >
              <option value="environment">Hostinger environment variable</option>
              <option value="database">Store a new key encrypted in the database</option>
              <option value="disabled">Disable the API key</option>
            </select>
            <small>{keySourceLabel}. Secret values are shown as a status only and cannot be read back from this panel.</small>
          </label>

          <label className="admin-settings-field">
            <span>New API key <em>(optional)</em></span>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value.slice(0, 500))}
              maxLength={500}
              autoComplete="off"
              spellCheck={false}
              placeholder={settings.apiKeyConfigured ? "Leave blank to keep the current key" : "Paste the ZRouter API key"}
            />
            <small>New keys are encrypted before storage. This field clears after saving, and keys are never written to logs.</small>
          </label>
        </div>

        <div className="admin-settings-card">
          <h3>Bot behavior</h3>
          <label className="admin-settings-field">
            <span>Bot instructions</span>
            <textarea
              value={settings.systemPrompt}
              onChange={(event) => update({ systemPrompt: event.target.value.slice(0, 8000) })}
              maxLength={8000}
              rows={9}
              required
            />
            <small>Built-in safety rules remain active separately from the instructions edited here.</small>
          </label>
        </div>

        <div className="admin-settings-card">
          <h3>Chat widget appearance</h3>
          <label className="admin-settings-field">
            <span>Title</span>
            <input value={settings.title} onChange={(event) => update({ title: event.target.value })} maxLength={120} required />
          </label>
          <label className="admin-settings-field">
            <span>Subtitle</span>
            <input value={settings.subtitle} onChange={(event) => update({ subtitle: event.target.value })} maxLength={240} />
          </label>
          <label className="admin-settings-field">
            <span>Welcome message</span>
            <input value={settings.welcome} onChange={(event) => update({ welcome: event.target.value })} maxLength={300} />
          </label>
          <label className="admin-settings-field">
            <span>Privacy notice</span>
            <input value={settings.privacyNote} onChange={(event) => update({ privacyNote: event.target.value })} maxLength={300} />
          </label>
          <label className="admin-settings-field">
            <span>Chat button label</span>
            <input value={settings.buttonLabel} onChange={(event) => update({ buttonLabel: event.target.value })} maxLength={50} required />
          </label>
          <label className="admin-settings-field">
            <span>WhatsApp link</span>
            <input
              type="url"
              value={settings.whatsappUrl}
              onChange={(event) => update({ whatsappUrl: event.target.value })}
              maxLength={500}
              required
            />
            <small>Use a secure link in the format https://wa.me/international-number.</small>
          </label>
        </div>

        <div className="admin-settings-actions">
          {error && <p className="admin-settings-error" role="alert">{error}</p>}
          <button type="submit" className="admin-save-btn" disabled={saving}>
            {saving ? "Saving…" : "Save chatbot settings"}
          </button>
        </div>
      </form>
    </section>
  );
}
