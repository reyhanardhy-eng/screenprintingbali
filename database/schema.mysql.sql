-- Hostinger MySQL schema. Run once against an empty database created in hPanel.
-- All write access stays on the Next.js server; the database is never exposed to browsers.

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  full_name VARCHAR(160) NULL,
  password_hash VARCHAR(255) NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  email_verified_at DATETIME NULL,
  totp_secret_enc TEXT NULL,
  totp_pending_enc TEXT NULL,
  totp_enabled TINYINT(1) NOT NULL DEFAULT 0,
  disabled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX users_role_active_idx (role, disabled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS oauth_accounts (
  provider VARCHAR(32) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (provider, provider_account_id),
  INDEX oauth_user_idx (user_id),
  CONSTRAINT oauth_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  auth_level ENUM('full', 'mfa_challenge', 'mfa_enrollment') NOT NULL DEFAULT 'full',
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME NULL,
  INDEX sessions_user_idx (user_id),
  INDEX sessions_expiry_idx (expires_at),
  CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_tokens (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  purpose ENUM('email_verification', 'password_reset') NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX auth_tokens_user_purpose_idx (user_id, purpose, consumed_at),
  CONSTRAINT auth_tokens_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS totp_recovery_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  code_hash CHAR(64) NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX totp_codes_user_idx (user_id, used_at),
  CONSTRAINT totp_codes_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_hash CHAR(64) NOT NULL PRIMARY KEY,
  hits INT UNSIGNED NOT NULL,
  window_started_at BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id CHAR(36) NULL,
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(80) NULL,
  target_id VARCHAR(120) NULL,
  ip_hash CHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX audit_created_idx (created_at),
  INDEX audit_actor_idx (actor_id, created_at),
  CONSTRAINT audit_actor_fk FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  slug VARCHAR(80) NOT NULL PRIMARY KEY,
  label VARCHAR(160) NOT NULL,
  has_cut_option TINYINT(1) NOT NULL DEFAULT 0,
  has_bag_size_option TINYINT(1) NOT NULL DEFAULT 0,
  moq INT UNSIGNED NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fabrics (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_slug VARCHAR(80) NOT NULL,
  value VARCHAR(100) NOT NULL,
  label VARCHAR(160) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY fabrics_product_value_unique (product_slug, value),
  CONSTRAINT fabrics_product_fk FOREIGN KEY (product_slug) REFERENCES products(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cuts (
  slug VARCHAR(80) NOT NULL PRIMARY KEY,
  label VARCHAR(160) NOT NULL,
  multiplier DECIMAL(10,4) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bag_sizes (
  slug VARCHAR(80) NOT NULL PRIMARY KEY,
  label VARCHAR(160) NOT NULL,
  dim VARCHAR(100) NOT NULL,
  multiplier DECIMAL(10,4) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS print_methods (
  slug VARCHAR(80) NOT NULL PRIMARY KEY,
  label VARCHAR(160) NOT NULL,
  type ENUM('dtf', 'screen') NOT NULL,
  moq INT UNSIGNED NOT NULL DEFAULT 1,
  film_rate_per_cm2 DECIMAL(12,6) NULL,
  press_margin DECIMAL(10,4) NULL,
  press_flat_cost DECIMAL(12,2) NULL,
  base_cost DECIMAL(12,2) NULL,
  per_extra_color DECIMAL(12,2) NULL,
  setup_per_color DECIMAL(12,2) NULL,
  applicable_products JSON NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS design_sizes (
  slug VARCHAR(80) NOT NULL PRIMARY KEY,
  label VARCHAR(160) NOT NULL,
  dim VARCHAR(100) NOT NULL,
  area_cm2 DECIMAL(12,2) NOT NULL,
  multiplier DECIMAL(10,4) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title_line1 VARCHAR(200) NOT NULL,
  title_line2 VARCHAR(200) NOT NULL DEFAULT '',
  meta VARCHAR(500) NOT NULL DEFAULT '',
  image_url VARCHAR(1000) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  visitor_id CHAR(36) NOT NULL UNIQUE,
  visitor_email VARCHAR(254) NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX conversations_recent_idx (status, last_message_at),
  CONSTRAINT conversations_visitor_fk FOREIGN KEY (visitor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id CHAR(36) NOT NULL,
  sender ENUM('visitor', 'admin') NOT NULL,
  sender_id CHAR(36) NOT NULL,
  body TEXT NOT NULL,
  read_by_admin TINYINT(1) NOT NULL DEFAULT 0,
  read_by_visitor TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX messages_conversation_created_idx (conversation_id, created_at),
  INDEX messages_unread_admin_idx (read_by_admin, created_at),
  CONSTRAINT messages_conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_fk FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT messages_body_nonempty CHECK (CHAR_LENGTH(TRIM(body)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default calculator data. Existing imported rows are preserved.
INSERT INTO products (slug, label, has_cut_option, has_bag_size_option, moq, sort_order) VALUES
  ('tshirt', 'T-shirt', 1, 0, 1, 1),
  ('hoodie', 'Hoodie', 1, 0, 1, 2),
  ('croptop', 'Crop top', 1, 0, 1, 3),
  ('tanktop', 'Tank top / Singlet', 1, 0, 1, 4),
  ('totebag', 'Totebag', 0, 1, 100, 5),
  ('paperbag', 'Paperbag', 0, 1, 100, 6)
ON DUPLICATE KEY UPDATE slug = VALUES(slug);

INSERT INTO fabrics (product_slug, value, label, price, sort_order) VALUES
  ('tshirt','combed16s','Combed 16s',115000,1), ('tshirt','combed24s','Combed 24s',105000,2),
  ('tshirt','combed30s','Combed 30s',90000,3), ('hoodie','fleece','Fleece premium',130000,1),
  ('croptop','combed24s','Combed 24s',95000,1), ('croptop','combed30s','Combed 30s',90000,2),
  ('tanktop','combed24s','Combed 24s',95000,1), ('tanktop','combed30s','Combed 30s',90000,2),
  ('totebag','spunbond','Spunbond',7000,1), ('totebag','blacu','Blacu',21000,2),
  ('totebag','rami','Rami / jute',28000,3), ('paperbag','kraft','Kraft',8500,1),
  ('paperbag','artcarton','Art carton',12500,2)
ON DUPLICATE KEY UPDATE value = VALUES(value);

INSERT INTO cuts (slug, label, multiplier, sort_order) VALUES
  ('basic','Basic',1.00,1), ('oversize','Oversize',1.10,2), ('boxy','Boxy',1.18,3), ('fitted','Fitted',1.20,4)
ON DUPLICATE KEY UPDATE slug = VALUES(slug);

INSERT INTO bag_sizes (slug, label, dim, multiplier, sort_order) VALUES
  ('small','Small','~25x30cm',0.80,1), ('medium','Medium','~30x40cm',1.00,2), ('large','Large','~35x45cm',1.25,3)
ON DUPLICATE KEY UPDATE slug = VALUES(slug);

INSERT INTO print_methods
  (slug,label,type,moq,film_rate_per_cm2,press_margin,press_flat_cost,base_cost,per_extra_color,setup_per_color,applicable_products,sort_order)
VALUES
  ('dtf','DTF','dtf',1,8.181818,1.6,12000,NULL,NULL,NULL,NULL,1),
  ('plastisol','Plastisol','screen',24,NULL,NULL,NULL,15000,8000,40000,JSON_ARRAY('tshirt','hoodie','croptop','tanktop'),2),
  ('rubber','Rubber','screen',24,NULL,NULL,NULL,11000,6000,40000,NULL,3),
  ('waterbased','Waterbased','screen',1,NULL,NULL,NULL,10000,5000,35000,JSON_ARRAY('totebag','paperbag'),4)
ON DUPLICATE KEY UPDATE slug = VALUES(slug);

INSERT INTO design_sizes (slug,label,dim,area_cm2,multiplier,sort_order) VALUES
  ('small','Small','A6, ~10x15cm',150,0.6,1), ('medium','Medium','A5, ~15x21cm',315,1.0,2),
  ('large','Large','A4, ~21x30cm',630,1.5,3), ('xl','XL','A3, ~30x42cm',1260,2.2,4)
ON DUPLICATE KEY UPDATE slug = VALUES(slug);
