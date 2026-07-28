import "server-only";
import { query } from "@/lib/db";
import type { IrsFiling, IrsFilingStatus, IrsFilingType } from "@/lib/irs-filing/status";
export type { IrsFiling, IrsFilingStatus, IrsFilingType } from "@/lib/irs-filing/status";

export async function getIrsFilingForRegistration(registrationId: string): Promise<IrsFiling | null> {
  const result = await query<IrsFiling>(
    "SELECT * FROM irs_filings WHERE registration_id = $1 ORDER BY updated_at DESC LIMIT 1",
    [registrationId]
  );
  return result.rows[0] ?? null;
}

// Called when a nonprofit registration's payment succeeds, same trigger
// point as ensureStateFiling() — see app/api/webhooks/stripe/route.ts. A
// retried webhook delivery can call this concurrently with itself for the
// same registration; registration_id is UNIQUE, so INSERT ... ON CONFLICT
// DO UPDATE finds-or-creates atomically instead of racing a SELECT against
// a later INSERT.
export async function ensureIrsFiling(registrationId: string, filingType: IrsFilingType = "1023-ez"): Promise<IrsFiling> {
  const result = await query<IrsFiling>(
    `INSERT INTO irs_filings (registration_id, filing_type) VALUES ($1, $2)
     ON CONFLICT (registration_id) DO UPDATE SET registration_id = irs_filings.registration_id
     RETURNING *`,
    [registrationId, filingType]
  );
  return result.rows[0];
}

export interface IrsFilingUpdate {
  status?: IrsFilingStatus;
  ein?: string;
  determinationLetterS3Key?: string;
}

// Keeps registrations.ein in sync so the existing dashboard EIN display
// (app/dashboard/filing-status/page.tsx's `active.ein`) reflects the same
// value as this table, rather than the two drifting independently.
export async function updateIrsFiling(id: string, update: IrsFilingUpdate): Promise<IrsFiling | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (update.status !== undefined) {
    sets.push(`status = $${i++}`);
    values.push(update.status);
    if (update.status === "submitted") {
      sets.push(`submitted_at = COALESCE(submitted_at, now())`);
    }
  }
  if (update.ein !== undefined) {
    sets.push(`ein = $${i++}`);
    values.push(update.ein);
  }
  if (update.determinationLetterS3Key !== undefined) {
    sets.push(`determination_letter_s3_key = $${i++}`);
    values.push(update.determinationLetterS3Key);
  }
  if (sets.length === 0) return null;

  sets.push(`updated_at = now()`);
  values.push(id);

  const result = await query<IrsFiling>(
    `UPDATE irs_filings SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  const updated = result.rows[0] ?? null;

  if (updated?.ein) {
    await query("UPDATE registrations SET ein = $1 WHERE id = $2", [updated.ein, updated.registration_id]);
  }

  return updated;
}
