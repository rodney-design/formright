// Client-safe (no "server-only") — mirrors lib/state-filing/status.ts and
// lib/registered-agent/status.ts.
export const CONTRACTOR_STATUSES = ["active", "inactive"] as const;
export type ContractorStatus = (typeof CONTRACTOR_STATUSES)[number];

export const PAYOUT_STATUSES = ["pending", "paid"] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export interface Contractor {
  id: string;
  user_id: string;
  states_covered: string[];
  status: ContractorStatus;
  payout_notes: string | null;
  created_at: string;
}

export interface ContractorWithUser extends Contractor {
  email: string;
  name: string | null;
}

export interface FilingChecklistItem {
  id: string;
  state_filing_id: string;
  label: string;
  sort_order: number;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
}

export interface ContractorPayout {
  id: string;
  contractor_id: string;
  state_filing_id: string | null;
  amount_cents: number;
  status: PayoutStatus;
  paid_at: string | null;
  created_at: string;
}

// A "job" is a manual filing task assigned to a contractor — either a state
// Articles filing or a registered agent order (the two "provider: manual"
// worksheet flows identified in db/migrations/015_contractors.sql). Kept as
// a shared shape so the contractor dashboard can list both in one place
// rather than two separate lists.
export interface ContractorJob {
  kind: "state_filing" | "registered_agent_order";
  id: string;
  registrationId: string;
  orgname: string;
  state: string;
  status: string;
}
