-- Contractor management — the humans who do FormRight's actual manual state
-- filings. state_filings.provider defaults to 'manual' because no state in
-- lib/state-filing/providers/ exposes a real filing API (see
-- providers/fileforms.ts, worksheet.ts) — someone has to take the generated
-- worksheet and transcribe it into the state's own portal by hand. Same is
-- true of registered_agent_orders (Northwest's wholesale channel is
-- phone/email, not an API — see 005_registered_agent.sql). Until now there
-- was no way to assign that work to a specific person, track a QA checklist
-- on it, or track what they're owed for it.
--
-- Contractors are regular `users` rows (role = 'contractor') rather than a
-- fully separate identity system, so they get the existing magic-link auth
-- for free — see lib/auth.ts's requireContractor().

ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('client','admin','super_admin','contractor'));

CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  states_covered TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  payout_notes TEXT, -- free-text payout method/instructions (e.g. "PayPal: name@example.com"); no processor integration yet
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE state_filings ADD COLUMN assigned_contractor_id UUID REFERENCES contractors(id);
ALTER TABLE registered_agent_orders ADD COLUMN assigned_contractor_id UUID REFERENCES contractors(id);

CREATE INDEX idx_state_filings_assigned_contractor ON state_filings(assigned_contractor_id) WHERE assigned_contractor_id IS NOT NULL;
CREATE INDEX idx_registered_agent_orders_assigned_contractor ON registered_agent_orders(assigned_contractor_id) WHERE assigned_contractor_id IS NOT NULL;

-- Minimal QA checklist, not a generic workflow engine — a fixed small set of
-- items staff/contractors check off per filing job (see
-- lib/contractors/checklist.ts for the seeded label set).
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
  state_filing_id UUID REFERENCES state_filings(id), -- nullable: ad-hoc payouts not tied to one job
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contractor_payouts_contractor ON contractor_payouts(contractor_id);
CREATE INDEX idx_contractor_payouts_status ON contractor_payouts(status) WHERE status = 'pending';
