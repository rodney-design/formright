-- Phase 3 migration: State Filing Integrations
-- Run after 002_phase2.sql. See ../schema.sql for the canonical, always-current schema.

CREATE TABLE state_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES registrations(id),
  state TEXT NOT NULL,
  filing_status TEXT NOT NULL DEFAULT 'not_submitted',  -- not_submitted, submitted, processing, approved, rejected
  state_confirmation_id TEXT,
  stamped_doc_s3_key TEXT,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE state_fees (
  state TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  base_fee_cents INTEGER NOT NULL,
  notes TEXT,                     -- e.g. "NY requires $200 publication"
  PRIMARY KEY (state, entity_type)
);

CREATE INDEX idx_state_filings_registration ON state_filings(registration_id);
CREATE INDEX idx_state_filings_status ON state_filings(filing_status) WHERE filing_status NOT IN ('approved', 'rejected');

-- Seed only the entity-type/state combinations the build-order doc gives verified
-- figures for (brief §8.3). Every other state+entity_type combination is
-- deliberately left unseeded rather than guessed — lib/entities/stateFees.ts's
-- getStateFeeForEntity() falls back to the existing flat per-state rate for
-- anything not in this table. Filling in the remaining ~340 combinations needs
-- a real accuracy pass against current Secretary of State fee schedules before
-- Phase 3 goes live for those states, not an invented placeholder.
INSERT INTO state_fees (state, entity_type, base_fee_cents, notes) VALUES
  ('Delaware', 'llc', 9000, NULL),
  ('Delaware', 'ccorp', 8900, NULL),
  ('Delaware', 'scorp', 8900, NULL),
  ('Delaware', 'nonprofit', 5000, NULL),
  ('New York', 'llc', 7500, 'Plus a publication requirement (~$200 in most counties, more in NYC) not included in this base fee — LLCs only.'),
  ('New York', 'ccorp', 7500, NULL),
  ('New York', 'scorp', 7500, NULL),
  ('California', 'llc', 7000, 'Plus an $800/yr minimum California franchise tax (recurring annual obligation, not a one-time filing fee), generally due within 3.5 months of formation.')
ON CONFLICT (state, entity_type) DO NOTHING;
