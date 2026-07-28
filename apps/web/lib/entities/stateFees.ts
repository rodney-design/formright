// Ported from formright_v2_pbc.html STATE_FEES (line 26333).
// Flat rate table, current as of 2026 per the prototype. See build-order doc §3:
// a per-entity-type state_fees table is a Should-Have for later, not a Phase 1 blocker.
export const STATE_FEES: Record<string, number> = {
  Alabama: 25, Alaska: 50, Arizona: 40, Arkansas: 50, California: 30,
  Colorado: 50, Connecticut: 50, Delaware: 89, Florida: 70, Georgia: 100,
  Hawaii: 25, Idaho: 30, Illinois: 50, Indiana: 30, Iowa: 20,
  Kansas: 35, Kentucky: 8, Louisiana: 75, Maine: 40, Maryland: 100,
  Massachusetts: 35, Michigan: 20, Minnesota: 70, Mississippi: 50, Missouri: 25,
  Montana: 15, Nebraska: 10, Nevada: 50, "New Hampshire": 25, "New Jersey": 75,
  "New Mexico": 25, "New York": 75, "North Carolina": 60, "North Dakota": 30, Ohio: 99,
  Oklahoma: 25, Oregon: 50, Pennsylvania: 70, "Rhode Island": 35, "South Carolina": 25,
  "South Dakota": 30, Tennessee: 100, Texas: 25, Utah: 30, Vermont: 125,
  Virginia: 75, Washington: 30, "West Virginia": 15, Wisconsin: 35, Wyoming: 25,
};

export function getStateFee(state: string | null | undefined): number | null {
  if (!state) return null;
  return STATE_FEES[state] ?? null;
}

// The full list of states the wizard's "State of Formation" dropdown offers
// (StepOrganization.tsx) — same source, so server-side validation can never
// reject a value the wizard itself let someone pick. Free-text `state`
// elsewhere (checkout, API v1) previously accepted anything: an unrecognized
// state silently produced a $0 state fee and propagated into documents and
// filings instead of erroring.
export function isValidState(state: string | null | undefined): boolean {
  return !!state && state in STATE_FEES;
}
