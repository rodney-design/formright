-- Pluggable vendor-filing-API support on top of the existing manual
-- state_filings tracking. Run after 005_registered_agent.sql. See
-- ../schema.sql for the canonical, always-current schema.
--
-- See apps/web/lib/state-filing/providers/ and README.md's "Phase 3" section
-- for context: no state exposes a direct filing API, but third-party filers
-- (FileForms, doola, ...) expose their own filing operations as a REST API +
-- webhooks. `provider` defaults to 'manual' (the existing worksheet-and-staff
-- flow) so nothing about existing rows or the admin PATCH flow changes;
-- registrations in states/tiers a provider is wired up for get `provider`
-- set to that vendor's name and `provider_filing_id` populated instead.

ALTER TABLE state_filings ADD COLUMN provider TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE state_filings ADD COLUMN provider_filing_id TEXT;

CREATE INDEX idx_state_filings_provider ON state_filings(provider, provider_filing_id) WHERE provider != 'manual';
