-- 0003: per-rijbewijs toegang. Elke pas krijgt een 'scope':
--   'all'  = volledige toegang (bestaande passen + admin-grants);
--   'b'    = rijbewijs B (secties praktijk/theorie/info);
--   'am'   = AM (bromfiets/scooter);
--   'motor'= A/motor;
--   'be'   = BE/aanhanger.
-- Bestaande passen worden 'all' zodat niemand toegang verliest (grandfather).
ALTER TABLE passes ADD COLUMN scope TEXT NOT NULL DEFAULT 'all';
