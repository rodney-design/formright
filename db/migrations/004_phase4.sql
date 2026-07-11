-- Phase 4 migration: B2B Pro Tier & API
-- Run after 003_phase3.sql. See ../schema.sql for the canonical, always-current schema.

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

ALTER TABLE registrations ADD COLUMN firm_id UUID REFERENCES firms(id);

-- Per-seat billing (build-order doc step 4: "Stripe seat-based subscriptions
-- tied to firm_members count"). Not in the doc's literal schema block, but
-- kept separate from `subscriptions` deliberately: that table is scoped to
-- an individual user_id (FormRight Comply), while Pro-tier seat billing is
-- scoped to the firm as a whole — overloading `subscriptions` would mean
-- either faking a user_id owner for a firm-level charge or loosening its
-- CHECK(plan IN ('comply','agent')) constraint to cover an unrelated concept.
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
