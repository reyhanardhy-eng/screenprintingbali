export const DEFAULT_LIVECHAT_WIDGET = {
  title: "Ask our AI assistant",
  subtitle: "For exact quotes, we’ll connect you with the team on WhatsApp.",
  welcome: "Ask about printing methods, minimums, and how to get started.",
  privacyNote: "Anonymous chat history is stored on Hostinger for up to 180 days after your last activity. Do not share passwords or payment details.",
  buttonLabel: "Chat with us",
  whatsappUrl: "https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20a%20print%20order",
} as const;

export const LEGACY_DEFAULT_LIVECHAT_PRIVACY_NOTE =
  "Pesan dikirim ke layanan AI untuk dijawab. Jangan kirim password atau detail pembayaran.";

export const LEGACY_ANONYMOUS_LIVECHAT_PRIVACY_NOTE =
  "Riwayat chat anonim disimpan di Hostinger hingga 180 hari sejak aktivitas terakhir. Jangan kirim password atau detail pembayaran.";

export type LivechatApiKeySource = "environment" | "database" | "disabled";

export type LivechatAdminSettings = {
  enabled: boolean;
  model: string;
  systemPrompt: string;
  apiKeySource: LivechatApiKeySource;
  apiKeyConfigured: boolean;
  title: string;
  subtitle: string;
  welcome: string;
  privacyNote: string;
  buttonLabel: string;
  whatsappUrl: string;
};
