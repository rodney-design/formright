-- FormRight schema (Phase 1 + Phase 2)
-- Postgres. Requires pgcrypto for gen_random_uuid().
-- Canonical, always-current schema. Incremental changes also live in
-- db/migrations/ for upgrading an existing database.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client','admin','super_admin')),
  magic_link_token TEXT,
  token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE registrations (
  id TEXT PRIMARY KEY,                  -- FR-XXXXXX format
  user_id UUID NOT NULL REFERENCES users(id),
  orgname TEXT NOT NULL,
  entity_type TEXT NOT NULL,            -- llc/ccorp/scorp/nonprofit/benefit/pc/sole
  state TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL,
  state_fee_cents INTEGER,
  board JSONB,                          -- board member array
  mission TEXT,
  contact_name TEXT,
  contact_email TEXT,
  address JSONB,
  ein TEXT,
  fiscal_year TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES registrations(id),
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  state_fee_cents INTEGER,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES registrations(id),
  doc_key TEXT NOT NULL,                -- matches ENTITY_DOCS_MAP keys
  s3_key TEXT,
  filename TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_documents_registration ON documents(registration_id);
CREATE INDEX idx_payments_registration ON payments(registration_id);

-- Phase 2 additions ─────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('comply','agent')),
  status TEXT NOT NULL,
  renews_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE compliance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES registrations(id),
  event_type TEXT NOT NULL,        -- e.g. annual_report, benefit_report, 2553_deadline
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reminded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_due ON compliance_events(due_date) WHERE status = 'pending';
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_compliance_registration ON compliance_events(registration_id);
