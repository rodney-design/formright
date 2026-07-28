import "server-only";
import { query } from "@/lib/db";
import type { FilingStatus, StateFiling } from "@/lib/state-filing/status";
export type { FilingStatus, StateFiling } from "@/lib/state-filing/status";

export async function getStateFilingById(id: string): Promise<StateFiling | null> {
  const result = await query<StateFiling>("SELECT * FROM state_filings WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function getStateFilingForRegistration(registrationId: string): Promise<StateFiling | null> {
  const result = await query<StateFiling>(
    "SELECT * FROM state_filings WHERE registration_id = $1 ORDER BY updated_at DESC LIMIT 1",
    [registrationId]
  );
  return result.rows[0] ?? null;
}

export async function getStateFilingByProviderFilingId(
  provider: string,
  providerFilingId: string
): Promise<StateFiling | null> {
  const result = await query<StateFiling>(
    "SELECT * FROM state_filings WHERE provider = $1 AND provider_filing_id = $2 LIMIT 1",
    [provider, providerFilingId]
  );
  return result.rows[0] ?? null;
}

// Called when a registration's payment succeeds (build-order doc §Phase 3:
// "on registration creation" for the row to track — payment success is the
// point at which we actually know filing needs to happen, mirroring when
// compliance_events get seeded).
export async function ensureStateFiling(registrationId: string, state: string): Promise<StateFiling> {
  const existing = await getStateFilingForRegistration(registrationId);
  if (existing) return existing;
  const result = await query<StateFiling>(
    "INSERT INTO state_filings (registration_id, state) VALUES ($1, $2) RETURNING *",
    [registrationId, state]
  );
  return result.rows[0];
}

export interface StateFilingUpdate {
  filingStatus?: FilingStatus;
  stateConfirmationId?: string;
  stampedDocS3Key?: string;
  provider?: string;
  providerFilingId?: string;
}

// BUG (fixed): filing_status could jump straight to "approved" with no
// requirement that a state confirmation ID ever exist — nothing stopped a
// PATCH from marking a fresh "not_submitted" filing "approved" with no
// evidence it was actually filed with the state. Thrown when the update (or
// the row's existing value) has no state_confirmation_id.
export class MissingStateConfirmationError extends Error {}

export async function updateStateFiling(id: string, update: StateFilingUpdate): Promise<StateFiling | null> {
  if (update.filingStatus === "approved" && update.stateConfirmationId === undefined) {
    const existing = await getStateFilingById(id);
    if (!existing?.state_confirmation_id) {
      throw new MissingStateConfirmationError(
        "Cannot mark a filing as approved without a state confirmation ID"
      );
    }
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (update.filingStatus !== undefined) {
    sets.push(`filing_status = $${i++}`);
    values.push(update.filingStatus);
    if (update.filingStatus === "submitted") {
      sets.push(`submitted_at = COALESCE(submitted_at, now())`);
    }
  }
  if (update.stateConfirmationId !== undefined) {
    sets.push(`state_confirmation_id = $${i++}`);
    values.push(update.stateConfirmationId);
  }
  if (update.stampedDocS3Key !== undefined) {
    sets.push(`stamped_doc_s3_key = $${i++}`);
    values.push(update.stampedDocS3Key);
  }
  if (update.provider !== undefined) {
    sets.push(`provider = $${i++}`);
    values.push(update.provider);
  }
  if (update.providerFilingId !== undefined) {
    sets.push(`provider_filing_id = $${i++}`);
    values.push(update.providerFilingId);
  }
  if (sets.length === 0) return null;

  sets.push(`updated_at = now()`);
  values.push(id);

  const result = await query<StateFiling>(
    `UPDATE state_filings SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}
