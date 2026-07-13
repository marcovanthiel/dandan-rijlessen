-- v4: een voucher hoort bij exact een product; aanvragen voor handmatige toegang.
-- Bestaande vouchers waren bedoeld voor Auto B en krijgen daarom veilig scope 'b'.
ALTER TABLE vouchers ADD COLUMN scope TEXT NOT NULL DEFAULT 'b';

CREATE TABLE IF NOT EXISTS access_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_access_requests_created ON access_requests(created_at);
