-- Phase 2 migration: Document Vault & Compliance
-- Run after 001_init.sql. See ../schema.sql for the canonical, always-current schema.

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
