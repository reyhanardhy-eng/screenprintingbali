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
        if (!response.ok) throw new Error(result.error || "Pengaturan chatbot gagal dimuat.");
        setSettings(result);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Pengaturan chatbot gagal dimuat."))
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
        throw new Error(result.error || "Pengaturan chatbot gagal disimpan.");
      }
      setSettings(result.settings);
      setApiKey("");
      flash("Pengaturan chatbot tersimpan.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pengaturan chatbot gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section id="chatbot-settings" className="admin-settings-section"><p className="admin-sub">Memuat pengaturan chatbot…</p></section>;
  }

  if (!settings) {
    return (
      <section id="chatbot-settings" className="admin-settings-section">
        <h2>Bot AI &amp; API</h2>
        <p className="admin-settings-error" role="alert">{error || "Pengaturan belum tersedia."}</p>
        <p className="admin-settings-help">Pastikan database Hostinger terhubung dan aplikasi memiliki akses ke tabel pengaturan.</p>
      </section>
    );
  }

  const keySourceLabel = settings.apiKeySource === "database"
    ? "Tersimpan terenkripsi di database Hostinger"
    : settings.apiKeySource === "environment"
      ? "Menggunakan variabel Hostinger ZROUTER_API_KEY"
      : "API key dinonaktifkan";

  return (
    <section id="chatbot-settings" className="admin-settings-section">
      <div className="admin-settings-heading">
        <div>
          <span className="eyebrow">Integrasi &amp; konten</span>
          <h2>Bot AI &amp; API</h2>
          <p className="admin-settings-help">Atur koneksi ZRouter, perilaku bot, teks widget, dan tautan WhatsApp. Perubahan langsung dipakai website.</p>
        </div>
        <span className={`admin-settings-pill${settings.enabled && settings.apiKeyConfigured ? " is-on" : ""}`}>
          {settings.enabled && settings.apiKeyConfigured ? "Bot aktif" : "Bot nonaktif"}
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
              <span>Aktifkan chatbot publik</span>
            </label>
          </div>

          <label className="admin-settings-field">
            <span>Provider dan endpoint</span>
            <input value="ZRouter · https://api.zrouter.dev/v1/chat/completions" readOnly />
            <small>Endpoint dikunci di server untuk mencegah penyalahgunaan koneksi. API key tidak pernah dikirim ke pengunjung.</small>
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
            <span>Sumber API key</span>
            <select
              value={settings.apiKeySource}
              onChange={(event) => {
                const apiKeySource = event.target.value as LivechatApiKeySource;
                update({ apiKeySource, ...(apiKeySource === "disabled" ? { enabled: false } : {}) });
              }}
            >
              <option value="environment">Variabel Hostinger</option>
              <option value="database">Simpan key baru secara terenkripsi</option>
              <option value="disabled">Nonaktifkan API key</option>
            </select>
            <small>{keySourceLabel}. Nilai rahasia hanya ditampilkan sebagai status dan tidak dapat dibaca kembali dari panel.</small>
          </label>

          <label className="admin-settings-field">
            <span>API key baru <em>(opsional)</em></span>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value.slice(0, 500))}
              maxLength={500}
              autoComplete="off"
              spellCheck={false}
              placeholder={settings.apiKeyConfigured ? "Kosongkan untuk mempertahankan key sekarang" : "Tempel API key ZRouter"}
            />
            <small>Key baru dienkripsi sebelum disimpan. Kolom ini kosong setelah penyimpanan dan key tidak masuk log.</small>
          </label>
        </div>

        <div className="admin-settings-card">
          <h3>Perilaku bot</h3>
          <label className="admin-settings-field">
            <span>Instruksi bot</span>
            <textarea
              value={settings.systemPrompt}
              onChange={(event) => update({ systemPrompt: event.target.value.slice(0, 8000) })}
              maxLength={8000}
              rows={9}
              required
            />
            <small>Aturan keamanan bawaan tetap dijalankan terpisah dari instruksi yang diedit di sini.</small>
          </label>
        </div>

        <div className="admin-settings-card">
          <h3>Tampilan chatbot</h3>
          <label className="admin-settings-field">
            <span>Judul</span>
            <input value={settings.title} onChange={(event) => update({ title: event.target.value })} maxLength={120} required />
          </label>
          <label className="admin-settings-field">
            <span>Subjudul</span>
            <input value={settings.subtitle} onChange={(event) => update({ subtitle: event.target.value })} maxLength={240} />
          </label>
          <label className="admin-settings-field">
            <span>Pesan pembuka</span>
            <input value={settings.welcome} onChange={(event) => update({ welcome: event.target.value })} maxLength={300} />
          </label>
          <label className="admin-settings-field">
            <span>Catatan privasi</span>
            <input value={settings.privacyNote} onChange={(event) => update({ privacyNote: event.target.value })} maxLength={300} />
          </label>
          <label className="admin-settings-field">
            <span>Teks tombol chat</span>
            <input value={settings.buttonLabel} onChange={(event) => update({ buttonLabel: event.target.value })} maxLength={50} required />
          </label>
          <label className="admin-settings-field">
            <span>Tautan WhatsApp</span>
            <input
              type="url"
              value={settings.whatsappUrl}
              onChange={(event) => update({ whatsappUrl: event.target.value })}
              maxLength={500}
              required
            />
            <small>Gunakan tautan aman berformat https://wa.me/nomor-internasional.</small>
          </label>
        </div>

        <div className="admin-settings-actions">
          {error && <p className="admin-settings-error" role="alert">{error}</p>}
          <button type="submit" className="admin-save-btn" disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan pengaturan chatbot"}
          </button>
        </div>
      </form>
    </section>
  );
}
