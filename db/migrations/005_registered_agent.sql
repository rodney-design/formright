-- Registered agent service fulfillment tracking.
-- Run after 004_phase4.sql. See ../schema.sql for the canonical, always-current schema.
--
-- Phase 2 build-order doc step 7 flagged "registered agent service" as gated
-- on a business decision (Northwest Registered Agent's API vs. in-house
-- fulfillment) rather than a pure build task. That decision landed on
-- Northwest — but researching their actual technical surface (same diligence
-- as the Phase 3 state-filing research) found no confirmed public,
-- self-serve API: their "Wholesale Registered Agent Partnership" is
-- sales-gated (phone/email onboarding with a wholesale specialist), not API
-- key issuance. So this is built the same way as state_filings: manual
-- fulfillment tracking with a pluggable seam, not a fake HTTP client.

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
