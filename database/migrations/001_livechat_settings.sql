-- Adds the Hostinger-backed admin controls for the live AI chat.
-- Safe to run more than once. Encrypted API keys stay server-side in MySQL.
CREATE TABLE IF NOT EXISTS livechat_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  model VARCHAR(120) NOT NULL DEFAULT 'gpt-5.4',
  system_prompt TEXT NULL,
  api_key_source ENUM('environment', 'database', 'disabled') NOT NULL DEFAULT 'environment',
  api_key_enc TEXT NULL,
  chat_title VARCHAR(120) NOT NULL DEFAULT 'Ask our AI assistant',
  chat_subtitle VARCHAR(240) NOT NULL DEFAULT 'For exact quotes, we’ll connect you with the team on WhatsApp.',
  chat_welcome VARCHAR(300) NOT NULL DEFAULT 'Ask about printing methods, minimums, and how to get started.',
  chat_privacy_note VARCHAR(300) NOT NULL DEFAULT 'Pesan dikirim ke layanan AI untuk dijawab. Jangan kirim password atau detail pembayaran.',
  chat_button_label VARCHAR(50) NOT NULL DEFAULT 'Chat with us',
  whatsapp_url VARCHAR(500) NOT NULL DEFAULT 'https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20a%20print%20order',
  updated_by CHAR(36) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT livechat_settings_updated_by_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
