-- Federal 501(c)(3) exemption status tracking — the missing half of
-- nonprofit filing status. state_filings tracks the state Articles filing;
-- nothing tracked the separate federal path (EIN -> Form 1023/1023-EZ
-- submission -> IRS determination letter), which for a nonprofit is the
-- step that actually matters (a state can "complete" a filing in days while
-- the IRS determination takes months). Same shape/precedent as
-- state_filings (099_phase3... see schema.sql "Phase 3 additions").

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
