PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL DEFAULT '',
  email_confirmed_at TEXT,
  user_metadata TEXT NOT NULL DEFAULT '{}',
  app_metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT,
  updated_at TEXT,
  banned_until TEXT,
  deleted_at TEXT,
  is_anonymous INTEGER NOT NULL DEFAULT 0 CHECK (is_anonymous IN (0, 1))
);

CREATE TABLE IF NOT EXISTS auth_identities (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  identity_data TEXT NOT NULL DEFAULT '{}',
  provider TEXT NOT NULL,
  last_sign_in_at TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS local_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS congregations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  state TEXT,
  organization_type TEXT NOT NULL DEFAULT 'church' CHECK (organization_type IN ('church', 'ong')),
  is_headquarters INTEGER NOT NULL DEFAULT 0 CHECK (is_headquarters IN (0, 1)),
  parent_id TEXT REFERENCES congregations(id),
  leader_name TEXT,
  organization_level TEXT NOT NULL DEFAULT 'local_congregation'
    CHECK (organization_level IN ('national_hq', 'state_hq', 'sub_hq', 'local_congregation')),
  CHECK (is_headquarters = (organization_level <> 'local_congregation'))
);

CREATE TABLE IF NOT EXISTS memberships (
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  congregation_id TEXT NOT NULL REFERENCES congregations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('central_admin', 'congregation_admin', 'treasurer', 'auditor', 'viewer')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, congregation_id)
);

CREATE TABLE IF NOT EXISTS membership_permission_overrides (
  user_id TEXT NOT NULL,
  congregation_id TEXT NOT NULL,
  financial_read INTEGER NOT NULL DEFAULT 1 CHECK (financial_read IN (0, 1)),
  financial_write INTEGER NOT NULL DEFAULT 0 CHECK (financial_write IN (0, 1)),
  financial_approve INTEGER NOT NULL DEFAULT 0 CHECK (financial_approve IN (0, 1)),
  closing_submit INTEGER NOT NULL DEFAULT 0 CHECK (closing_submit IN (0, 1)),
  audit_read INTEGER NOT NULL DEFAULT 0 CHECK (audit_read IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  hierarchy_view INTEGER NOT NULL DEFAULT 0 CHECK (hierarchy_view IN (0, 1)),
  hierarchy_financial_read INTEGER NOT NULL DEFAULT 0 CHECK (hierarchy_financial_read IN (0, 1)),
  PRIMARY KEY (user_id, congregation_id),
  FOREIGN KEY (user_id, congregation_id) REFERENCES memberships(user_id, congregation_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  congregation_id TEXT NOT NULL REFERENCES congregations(id),
  occurred_on TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  category TEXT NOT NULL,
  origin TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  purpose TEXT,
  receipt_id TEXT,
  recorded_by TEXT NOT NULL REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_internal_transfer INTEGER NOT NULL DEFAULT 0 CHECK (is_internal_transfer IN (0, 1))
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  congregation_id TEXT NOT NULL REFERENCES congregations(id),
  occurred_on TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  vendor TEXT,
  payment_method TEXT NOT NULL,
  purpose TEXT,
  cost_center TEXT,
  receipt_id TEXT,
  approved_by TEXT REFERENCES app_users(id),
  recorded_by TEXT NOT NULL REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reversed')),
  approved_at TEXT,
  is_internal_transfer INTEGER NOT NULL DEFAULT 0 CHECK (is_internal_transfer IN (0, 1))
);

CREATE TABLE IF NOT EXISTS headquarters_transfers (
  id TEXT PRIMARY KEY,
  origin_congregation_id TEXT NOT NULL REFERENCES congregations(id),
  destination_name TEXT NOT NULL,
  reference_period TEXT NOT NULL,
  amount_requested_cents INTEGER CHECK (amount_requested_cents > 0),
  amount_approved_cents INTEGER CHECK (amount_approved_cents > 0),
  amount_sent_cents INTEGER CHECK (amount_sent_cents > 0),
  amount_received_cents INTEGER CHECK (amount_received_cents >= 0),
  occurred_on TEXT,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'requested', 'approved', 'sent', 'confirmed', 'questioned', 'cancelled')),
  reason TEXT NOT NULL,
  requested_by TEXT NOT NULL REFERENCES app_users(id),
  approved_by TEXT REFERENCES app_users(id),
  approved_at TEXT,
  receipt_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS headquarters_transfer_sends (
  id TEXT PRIMARY KEY,
  transfer_id TEXT NOT NULL UNIQUE REFERENCES headquarters_transfers(id) ON DELETE RESTRICT,
  occurred_on TEXT NOT NULL,
  amount_sent_cents INTEGER NOT NULL CHECK (amount_sent_cents > 0),
  method TEXT NOT NULL CHECK (method IN ('pix', 'transfer', 'deposit', 'cash')),
  reference TEXT,
  note TEXT,
  sent_by TEXT NOT NULL REFERENCES app_users(id),
  idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (transfer_id, idempotency_key),
  CHECK (method <> 'cash' OR length(trim(coalesce(reference, ''))) > 0)
);

CREATE TABLE IF NOT EXISTS monthly_closings (
  id TEXT NOT NULL UNIQUE,
  congregation_id TEXT NOT NULL REFERENCES congregations(id),
  reference_period TEXT NOT NULL,
  opening_balance_cents INTEGER NOT NULL DEFAULT 0,
  adjustments_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'submitted', 'approved', 'questioned', 'closed')),
  submitted_by TEXT REFERENCES app_users(id),
  approved_by TEXT REFERENCES app_users(id),
  closed_at TEXT,
  PRIMARY KEY (congregation_id, reference_period)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES app_users(id),
  congregation_id TEXT REFERENCES congregations(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  before_data TEXT,
  after_data TEXT,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  congregation_id TEXT NOT NULL REFERENCES congregations(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_adjustments (
  id TEXT PRIMARY KEY,
  congregation_id TEXT NOT NULL REFERENCES congregations(id),
  reference_period TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('entries', 'expenses')),
  entity_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents <> 0),
  reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'voided')),
  created_by TEXT NOT NULL REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idempotency_key TEXT NOT NULL UNIQUE,
  UNIQUE (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS financial_reversals (
  id TEXT PRIMARY KEY,
  congregation_id TEXT NOT NULL REFERENCES congregations(id),
  reference_period TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('entries', 'expenses')),
  entity_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'voided')),
  created_by TEXT NOT NULL REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idempotency_key TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS period_reopening_requests (
  id TEXT PRIMARY KEY,
  congregation_id TEXT NOT NULL REFERENCES congregations(id),
  reference_period TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by TEXT NOT NULL REFERENCES app_users(id),
  approved_by TEXT REFERENCES app_users(id),
  requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT
);

CREATE TABLE IF NOT EXISTS physical_cash_registers (
  id TEXT PRIMARY KEY,
  congregation_id TEXT NOT NULL REFERENCES congregations(id),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_by TEXT NOT NULL REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS physical_cash_periods (
  id TEXT PRIMARY KEY,
  cash_register_id TEXT NOT NULL REFERENCES physical_cash_registers(id),
  reference_period TEXT NOT NULL,
  opening_balance_cents INTEGER NOT NULL CHECK (opening_balance_cents >= 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  counted_balance_cents INTEGER CHECK (counted_balance_cents >= 0),
  counted_by TEXT REFERENCES app_users(id),
  counted_at TEXT,
  divergence_reason TEXT,
  closed_by TEXT REFERENCES app_users(id),
  closed_at TEXT,
  created_by TEXT NOT NULL REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((counted_balance_cents IS NULL AND counted_by IS NULL AND counted_at IS NULL)
      OR (counted_balance_cents IS NOT NULL AND counted_by IS NOT NULL AND counted_at IS NOT NULL)),
  UNIQUE (cash_register_id, reference_period)
);

CREATE TABLE IF NOT EXISTS physical_cash_movements (
  id TEXT PRIMARY KEY,
  cash_period_id TEXT NOT NULL REFERENCES physical_cash_periods(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('cash_in', 'cash_expense', 'deposit')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  source_entity_type TEXT,
  source_entity_id TEXT,
  created_by TEXT NOT NULL REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idempotency_key TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS khatam_licenses (
  congregation_id TEXT PRIMARY KEY REFERENCES congregations(id) ON DELETE CASCADE,
  seats_total INTEGER NOT NULL CHECK (seats_total >= 0),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS memberships_congregation_idx ON memberships(congregation_id);
CREATE INDEX IF NOT EXISTS congregations_parent_id_idx ON congregations(parent_id);
CREATE INDEX IF NOT EXISTS entries_congregation_date_idx ON entries(congregation_id, occurred_on);
CREATE INDEX IF NOT EXISTS expenses_congregation_date_idx ON expenses(congregation_id, occurred_on);
CREATE INDEX IF NOT EXISTS transfers_congregation_period_idx ON headquarters_transfers(origin_congregation_id, reference_period);
CREATE INDEX IF NOT EXISTS audit_events_congregation_date_idx ON audit_events(congregation_id, occurred_at);
CREATE INDEX IF NOT EXISTS physical_cash_periods_register_period_idx ON physical_cash_periods(cash_register_id, reference_period);
CREATE INDEX IF NOT EXISTS physical_cash_movements_period_date_idx ON physical_cash_movements(cash_period_id, created_at);
CREATE INDEX IF NOT EXISTS sessions_user_expiry_idx ON local_sessions(user_id, expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS financial_reversals_entity_idx ON financial_reversals(entity_type, entity_id);

CREATE VIEW IF NOT EXISTS congregation_monthly_entry_categories AS
SELECT congregation_id, strftime('%Y-%m-01', occurred_on) AS reference_period, category,
       sum(amount_cents) AS amount_cents
FROM entries
GROUP BY congregation_id, strftime('%Y-%m-01', occurred_on), category;

CREATE VIEW IF NOT EXISTS congregation_monthly_summary AS
WITH months AS (
  SELECT congregation_id, strftime('%Y-%m-01', occurred_on) AS reference_period FROM entries
  UNION SELECT congregation_id, strftime('%Y-%m-01', occurred_on) FROM expenses
  UNION SELECT origin_congregation_id, strftime('%Y-%m-01', coalesce(occurred_on, reference_period)) FROM headquarters_transfers
  UNION SELECT congregation_id, reference_period FROM financial_adjustments
  UNION SELECT congregation_id, reference_period FROM financial_reversals
), entry_totals AS (
  SELECT congregation_id, strftime('%Y-%m-01', occurred_on) AS reference_period, sum(amount_cents) AS entries
  FROM entries GROUP BY congregation_id, strftime('%Y-%m-01', occurred_on)
), expense_totals AS (
  SELECT congregation_id, strftime('%Y-%m-01', occurred_on) AS reference_period, sum(amount_cents) AS expenses
  FROM expenses GROUP BY congregation_id, strftime('%Y-%m-01', occurred_on)
), transfer_totals AS (
  SELECT origin_congregation_id AS congregation_id,
         strftime('%Y-%m-01', coalesce(occurred_on, reference_period)) AS reference_period,
         sum(CASE WHEN status <> 'cancelled' THEN coalesce(amount_sent_cents, 0) ELSE 0 END) AS transfers
  FROM headquarters_transfers
  GROUP BY origin_congregation_id, strftime('%Y-%m-01', coalesce(occurred_on, reference_period))
), adjustment_totals AS (
  SELECT congregation_id, reference_period, sum(amount_cents) AS adjustments
  FROM financial_adjustments WHERE status = 'posted' GROUP BY congregation_id, reference_period
), reversal_totals AS (
  SELECT congregation_id, reference_period,
         sum(CASE WHEN entity_type = 'entries' THEN -amount_cents ELSE amount_cents END) AS reversals
  FROM financial_reversals WHERE status = 'posted' GROUP BY congregation_id, reference_period
)
SELECT m.congregation_id, m.reference_period,
       coalesce(c.opening_balance_cents, 0) AS opening_balance,
       coalesce(e.entries, 0) AS entries,
       coalesce(x.expenses, 0) AS expenses,
       coalesce(t.transfers, 0) AS transfers,
       coalesce(c.adjustments_cents, 0) + coalesce(a.adjustments, 0) AS adjustments,
       coalesce(c.opening_balance_cents, 0) + coalesce(e.entries, 0) - coalesce(x.expenses, 0)
         - coalesce(t.transfers, 0) + coalesce(a.adjustments, 0) + coalesce(r.reversals, 0)
         + coalesce(c.adjustments_cents, 0) AS closing_balance,
       c.status AS closing_status
FROM months m
LEFT JOIN monthly_closings c USING (congregation_id, reference_period)
LEFT JOIN entry_totals e USING (congregation_id, reference_period)
LEFT JOIN expense_totals x USING (congregation_id, reference_period)
LEFT JOIN transfer_totals t USING (congregation_id, reference_period)
LEFT JOIN adjustment_totals a USING (congregation_id, reference_period)
LEFT JOIN reversal_totals r USING (congregation_id, reference_period);
