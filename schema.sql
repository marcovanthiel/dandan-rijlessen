-- Dandan Drive: schema v1 (fase 1: accounts, sessies, passen, statistiek)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  lang TEXT NOT NULL DEFAULT 'zh',
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS login_codes (
  email TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  ua TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS passes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,             -- '1m' | '3m' | '6m' | '12m' | 'admin'
  starts_at TEXT NOT NULL DEFAULT (datetime('now')),
  ends_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'admin', -- 'admin' | 'wechatpay' | ... (fase 2)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_passes_user ON passes(user_id);
CREATE TABLE IF NOT EXISTS events (
  day TEXT NOT NULL,
  type TEXT NOT NULL,             -- 'view' | 'signup' | 'login' | 'locked_view'
  path TEXT NOT NULL DEFAULT '',
  ref TEXT NOT NULL DEFAULT '',
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, type, path, ref)
);
INSERT OR IGNORE INTO users (email, lang, is_admin) VALUES ('marco@marcovanthiel.nl', 'zh', 1);
INSERT OR IGNORE INTO users (email, lang, is_admin) VALUES ('dandan@dandanvanthiel.nl', 'zh', 1);
