// Phase 3 (build-order doc §Phase 3, brief §8.3): entity-type-specific fees
// from the normalized `state_fees` table, falling back to the flat
// STATE_FEES rate in ./stateFees.ts when no entity-specific row exists yet.
// Only a handful of state+entity_type combinations are seeded so far (see
// db/migrations/003_phase3.sql) — everything else still uses the flat rate
// until it's been verified against the state's current fee schedule.
//
// Split from stateFees.ts (rather than adding a DB call there) because that
// file is imported by client components (the onboarding wizard) for the
// static STATE_FEES/getStateFee() lookup — pulling in lib/db's `pg` import
// there breaks the client bundle (Node-only builtins like `net`/`tls`).
import "server-only";
import { query } from "@/lib/db";
import { getStateFee } from "./stateFees";

export interface StateFeeDetail {
  feeCents: number;
  notes: string | null;
}

export async function getStateFeeForEntity(
  state: string | null | undefined,
  entityType: string
): Promise<StateFeeDetail | null> {
  if (!state) return null;
  const result = await query<{ base_fee_cents: number; notes: string | null }>(
    "SELECT base_fee_cents, notes FROM state_fees WHERE state = $1 AND entity_type = $2",
    [state, entityType]
  );
  if (result.rows[0]) {
    return { feeCents: result.rows[0].base_fee_cents, notes: result.rows[0].notes };
  }
  const flatDollars = getStateFee(state);
  return flatDollars !== null ? { feeCents: flatDollars * 100, notes: null } : null;
}
