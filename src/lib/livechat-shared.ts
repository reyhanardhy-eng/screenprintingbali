export const DEFAULT_LIVECHAT_WIDGET = {
  title: "Ask our AI assistant",
  subtitle: "For exact quotes, we’ll connect you with the team on WhatsApp.",
  welcome: "Ask about printing methods, minimums, and how to get started.",
  privacyNote: "Pesan dikirim ke layanan AI untuk dijawab. Jangan kirim password atau detail pembayaran.",
  buttonLabel: "Chat with us",
  whatsappUrl: "https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20a%20print%20order",
} as const;

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
