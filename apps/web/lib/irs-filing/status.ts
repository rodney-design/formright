// Client-safe (no "server-only") — mirrors lib/state-filing/status.ts and
// lib/registered-agent/status.ts.
export const IRS_FILING_TYPES = ["1023", "1023-ez"] as const;
export type IrsFilingType = (typeof IRS_FILING_TYPES)[number];

export const IRS_FILING_STATUSES = [
  "not_started",
  "ein_obtained",
  "submitted",
  "additional_info_requested",
  "approved",
  "denied",
] as const;
export type IrsFilingStatus = (typeof IRS_FILING_STATUSES)[number];

export interface IrsFiling {
  id: string;
  registration_id: string;
  filing_type: IrsFilingType;
  status: IrsFilingStatus;
  ein: string | null;
  determination_letter_s3_key: string | null;
  submitted_at: string | null;
  updated_at: string;
  created_at: string;
}
