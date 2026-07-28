-- FormRight schema (Phase 1 + Phase 2)
-- Postgres. Requires pgcrypto for gen_random_uuid().
-- Canonical, always-current schema. Incremental changes also live in
-- db/migrations/ for upgrading an existing database.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client','admin','super_admin','contractor')),
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
  notes JSONB,                           -- structured data written by checkout; not for free-text edits, see admin_notes
  admin_notes TEXT,                     -- free-text notes editable from the admin dashboard
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
  s3_key TEXT NOT NULL,
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

-- Phase 3 additions ─────────────────────────────────────────────────────────

CREATE TABLE state_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES registrations(id),
  state TEXT NOT NULL,
  filing_status TEXT NOT NULL DEFAULT 'not_submitted',  -- not_submitted, submitted, processing, approved, rejected
  state_confirmation_id TEXT,
  stamped_doc_s3_key TEXT,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provider TEXT NOT NULL DEFAULT 'manual',  -- 'manual' (staff worksheet) or a vendor name, e.g. 'fileforms'
  provider_filing_id TEXT                   -- vendor's filing ID, when provider != 'manual'
);

CREATE INDEX idx_state_filings_provider ON state_filings(provider, provider_filing_id) WHERE provider != 'manual';

CREATE TABLE state_fees (
  state TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  base_fee_cents INTEGER NOT NULL,
  notes TEXT,                     -- e.g. "NY requires $200 publication"
  PRIMARY KEY (state, entity_type)
);

CREATE INDEX idx_state_filings_registration ON state_filings(registration_id);
CREATE INDEX idx_state_filings_status ON state_filings(filing_status) WHERE filing_status NOT IN ('approved', 'rejected');
-- state_fees seed data (partial — see db/migrations/003_phase3.sql) lives in
-- the migration, not here, since it's reference data that changes independently
-- of the schema shape.

-- Phase 4 additions ─────────────────────────────────────────────────────────

CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  branding JSONB,                 -- logo url, colors for white-label PDFs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE firm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('firm_admin','firm_member')),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id),
  key_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- firm_id is added here (Phase 4 section) rather than inline in the
-- registrations table above, since firms doesn't exist yet at that point in
-- this linear script — mirrors db/migrations/004_phase4.sql exactly.
ALTER TABLE registrations ADD COLUMN firm_id UUID REFERENCES firms(id);

-- Per-seat billing (build-order doc step 4). Deliberately separate from
-- `subscriptions`: that table is scoped to an individual user_id (FormRight
-- Comply), while Pro-tier seat billing is scoped to the firm as a whole.
CREATE TABLE firm_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  renews_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_firm_members_unique ON firm_members(firm_id, user_id);
CREATE INDEX idx_firm_members_user ON firm_members(user_id);
CREATE INDEX idx_firm_members_firm ON firm_members(firm_id);
CREATE INDEX idx_api_keys_firm ON api_keys(firm_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE revoked_at IS NULL;
CREATE INDEX idx_registrations_firm ON registrations(firm_id);
CREATE INDEX idx_firm_subscriptions_firm ON firm_subscriptions(firm_id);

-- Registered agent fulfillment tracking ─────────────────────────────────────
-- See db/migrations/005_registered_agent.sql for why this is manual
-- fulfillment tracking rather than a Northwest API client — no confirmed
-- public, self-serve API exists as of the research pass behind this table.

CREATE TABLE registered_agent_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES registrations(id),
  status TEXT NOT NULL DEFAULT 'not_requested',  -- not_requested, requested, active, canceled
  provider TEXT NOT NULL DEFAULT 'northwest',
  provider_confirmation_id TEXT,
  requested_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_registered_agent_orders_registration ON registered_agent_orders(registration_id);
CREATE INDEX idx_registered_agent_orders_status ON registered_agent_orders(status) WHERE status NOT IN ('active', 'canceled');

-- Compliance rules engine ────────────────────────────────────────────────
-- Data-driven per-state annual-report due dates, replacing the
-- formation-anniversary approximation in seedComplianceEvents() for states
-- with a verified rule. entity_family = 'all' is a wildcard matched when no
-- entity-family-specific row exists for that state (see
-- lib/entities/complianceRulesTable.ts). Only CA/DE/FL/NY/TX are seeded —
-- see db/migrations/007_compliance_rules.sql for sourcing/citations. Every
-- other state falls back to the existing anniversary approximation rather
-- than a guessed rule row, same posture as state_fees.

CREATE TABLE compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  entity_family TEXT NOT NULL,  -- llc/ccorp/scorp/nonprofit/benefit/pc, or 'all'
  event_type TEXT NOT NULL DEFAULT 'annual_report',
  -- not_required = true means this (state, entity_family) has no annual
  -- report/renewal obligation at all (e.g. a plain South Carolina LLC not
  -- taxed as a corporation) — the app skips generating the event entirely
  -- rather than falling back to a guessed date. rule_type/cadence are NULL
  -- in that case; the CHECK enforces one or the other, not both missing.
  not_required BOOLEAN NOT NULL DEFAULT false,
  rule_type TEXT CHECK (rule_type IN (
    'fixed_date',                 -- same calendar date every year/biennium (fixed_month/fixed_day)
    'anniversary_month_last_day', -- last day of the formation month (CA, NY, NJ, VA, CT-corp style)
    'anniversary_month_first_day',-- 1st day of the formation month (Illinois)
    'anniversary_quarter_end',    -- last day of the calendar quarter containing the formation month (Wisconsin)
    'anniversary_month_offset_end', -- last day of the Nth month after the formation month (offset_months) (Colorado)
    'anniversary_exact_date',     -- the literal formation date each year (Massachusetts LLC style)
    'fiscal_year_offset'          -- N months after fiscal year end, day D or last-day-of-month (offset_months/offset_day)
  )),
  cadence TEXT CHECK (cadence IN ('annual', 'biennial')),
  fixed_month INTEGER CHECK (fixed_month BETWEEN 1 AND 12),  -- only for rule_type = 'fixed_date'
  fixed_day INTEGER CHECK (fixed_day BETWEEN 1 AND 31),      -- only for rule_type = 'fixed_date'
  offset_months INTEGER,     -- only for rule_type = 'fiscal_year_offset'
  offset_day INTEGER CHECK (offset_day BETWEEN 1 AND 31),  -- fiscal_year_offset only; NULL = last day of the target month
  -- Only meaningful with rule_type = 'fixed_date': some states run a fixed
  -- biennial filing calendar anchored to odd/even calendar years rather than
  -- "2 years after formation" (Iowa: always April 1 of an odd year). When
  -- set, the computed candidate rolls forward a year until it matches.
  year_parity TEXT CHECK (year_parity IN ('odd', 'even')),
  notes TEXT,
  source TEXT,               -- citation for the verified figure
  verified_at DATE NOT NULL,
  UNIQUE (state, entity_family, event_type),
  CHECK (not_required OR (rule_type IS NOT NULL AND cadence IS NOT NULL))
);

-- Nonprofit statutory reference data ────────────────────────────────────
-- Per-state nonprofit-corporation-act citations, and — where a state's own
-- act mandates specific Articles language — the actual required statutory
-- statement. Same posture/precedent as compliance_rules above: only
-- DE/CA/FL/NY/TX are seeded, each row checked against the state's published
-- statute text; see db/migrations/013_nonprofit_statutes.sql for sourcing.
-- This is sourced legal-reference data for template fallback and staff use,
-- not a substitute for review by a licensed attorney in the jurisdiction of
-- formation. Every unseeded state keeps using the generic 501(c)(3)
-- template in buildArticles() (lib/doc-engine/builders/nonprofit.ts).

CREATE TABLE nonprofit_statutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  subtype TEXT,  -- 'public_benefit' | 'mutual_benefit' | 'religious' (California), or NULL
  act_name TEXT NOT NULL,
  act_citation TEXT NOT NULL,
  statute_url TEXT,
  purpose_clause TEXT,   -- mandated Articles purpose statement, or NULL if none
  dissolution_note TEXT, -- citation/mechanism for Article XI, free text
  source TEXT NOT NULL,
  verified_at DATE NOT NULL,
  UNIQUE (state, subtype)
);

CREATE INDEX idx_nonprofit_statutes_state ON nonprofit_statutes(state);

-- Federal 501(c)(3) exemption status tracking ───────────────────────────
-- state_filings (Phase 3 additions above) tracks the state Articles filing
-- only. Nonprofits also have a separate, usually much longer federal path —
-- EIN -> Form 1023/1023-EZ submission -> IRS determination letter — that
-- wasn't tracked as a first-class status anywhere. See
-- db/migrations/014_irs_filings.sql.

CREATE TABLE irs_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES registrations(id),
  filing_type TEXT NOT NULL DEFAULT '1023-ez' CHECK (filing_type IN ('1023', '1023-ez')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'ein_obtained', 'submitted', 'additional_info_requested', 'approved', 'denied'
  )),
  ein TEXT,
  determination_letter_s3_key TEXT,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_irs_filings_registration ON irs_filings(registration_id);
CREATE INDEX idx_irs_filings_status ON irs_filings(status) WHERE status NOT IN ('approved', 'denied');

-- Contractor management ──────────────────────────────────────────────────
-- The humans who do FormRight's actual manual state filings and registered
-- agent orders (see the state_filings.provider / registered_agent_orders.provider
-- comments above — no state exposes a real filing API, and Northwest's
-- wholesale channel is phone/email). See db/migrations/015_contractors.sql.
-- Contractors are `users` rows (role = 'contractor') so they get the
-- existing magic-link auth for free.

CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  states_covered TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  payout_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE state_filings ADD COLUMN assigned_contractor_id UUID REFERENCES contractors(id);
ALTER TABLE registered_agent_orders ADD COLUMN assigned_contractor_id UUID REFERENCES contractors(id);

CREATE INDEX idx_state_filings_assigned_contractor ON state_filings(assigned_contractor_id) WHERE assigned_contractor_id IS NOT NULL;
CREATE INDEX idx_registered_agent_orders_assigned_contractor ON registered_agent_orders(assigned_contractor_id) WHERE assigned_contractor_id IS NOT NULL;

-- Minimal QA checklist, not a generic workflow engine — a fixed small set of
-- items per filing job (see lib/contractors/checklist.ts for the seeded
-- label set).
CREATE TABLE filing_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_filing_id UUID NOT NULL REFERENCES state_filings(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES contractors(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_filing_checklist_items_state_filing ON filing_checklist_items(state_filing_id);

CREATE TABLE contractor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  state_filing_id UUID REFERENCES state_filings(id),
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contractor_payouts_contractor ON contractor_payouts(contractor_id);
CREATE INDEX idx_contractor_payouts_status ON contractor_payouts(status) WHERE status = 'pending';
