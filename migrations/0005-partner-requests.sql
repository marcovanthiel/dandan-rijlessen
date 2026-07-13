-- v5: publieke demo- en offerteaanvragen van rijscholen.
CREATE TABLE IF NOT EXISTS partner_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  learner_range TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_partner_requests_created ON partner_requests(created_at);
