// Client-safe (no "server-only") — shared between lib/queries/stateFilings.ts
// (server-only DB access) and client components like StateFilingPanel that
// only need the status enum/shape, not the DB queries.
export const FILING_STATUSES = ["not_submitted", "submitted", "processing", "approved", "rejected"] as const;
export type FilingStatus = (typeof FILING_STATUSES)[number];

export interface StateFiling {
  id: string;
  registration_id: string;
  state: string;
  filing_status: FilingStatus;
  state_confirmation_id: string | null;
  stamped_doc_s3_key: string | null;
  submitted_at: string | null;
  updated_at: string;
}
