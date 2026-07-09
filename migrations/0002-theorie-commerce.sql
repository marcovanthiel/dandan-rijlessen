-- v2: voortgang/examens/flashcards + commerce-voorbereiding (vouchers, orders,
-- referral, reviews) + studieschema. Eenmalig toepassen (ALTER is niet idempotent).
ALTER TABLE users ADD COLUMN exam_date TEXT;
ALTER TABLE users ADD COLUMN ref_code TEXT;
ALTER TABLE users ADD COLUMN referred_by TEXT;
CREATE TABLE IF NOT EXISTS progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part_key TEXT NOT NULL,            -- 'p:module-1:s3' (praktijk) | 't:module-2:sec1' (theorie)
  done_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, part_key)
);
CREATE TABLE IF NOT EXISTS exam_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,                -- 'examen' | 'oefenen:<onderwerp>'
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  vragen TEXT NOT NULL,              -- JSON: vraag-ids
  antwoorden TEXT NOT NULL DEFAULT '{}', -- JSON: id -> gekozen index
  score INTEGER, totaal INTEGER, geslaagd INTEGER
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON exam_attempts(user_id, started_at);
CREATE TABLE IF NOT EXISTS vouchers (
  code TEXT PRIMARY KEY,             -- hoofdletters/cijfers
  kind TEXT NOT NULL,                -- '1m'|'3m'|'6m'|'12m'
  campagne TEXT NOT NULL DEFAULT '',
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,               -- uuid
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, amount_cents INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'wacht_op_betaalmethode', -- fase 2: 'open'|'paid'|'failed' via provider-webhook
  provider TEXT NOT NULL DEFAULT 'geen',                 -- straks 'wechatpay'
  provider_ref TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  naam TEXT NOT NULL, taal TEXT NOT NULL DEFAULT 'zh',
  tekst TEXT NOT NULL, sterren INTEGER NOT NULL DEFAULT 5,
  zichtbaar INTEGER NOT NULL DEFAULT 0,   -- admin keurt goed; nooit verzonnen content
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
