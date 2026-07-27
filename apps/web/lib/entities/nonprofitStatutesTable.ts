// Per-state nonprofit statutory reference data (sourced Articles purpose
// clauses and dissolution citations) — see db/migrations/013_nonprofit_statutes.sql
// for sourcing/citations and the caveat that this is reference data checked
// against published statute text, not attorney-certified legal advice.
// Same DB-backed/fallback shape as getComplianceRule() in
// complianceRulesTable.ts: an exact (state, subtype) row wins, a
// (state, NULL) row is the state-level fallback, and no row at all means
// "unseeded" — the caller falls back to the existing generic template.
import "server-only";
import { query } from "@/lib/db";

export type NonprofitSubtype = "public_benefit" | "mutual_benefit" | "religious";

export interface NonprofitStatute {
  actName: string;
  actCitation: string;
  statuteUrl: string | null;
  purposeClause: string | null;
  dissolutionNote: string | null;
  source: string;
}

// California is the only state seeded with subtypes today. Public benefit is
// the default for 501(c)(3) charitable/educational/scientific purposes;
// mutual benefit covers member-serving categories (business leagues, social
// clubs) that generally aren't 501(c)(3)-eligible; religious is its own
// statutory track. Derived from the onboarding entity-type string rather
// than a dedicated onboarding field, since the federal 501(c) sub-type
// already selected in Step 1 (see lib/data/entityTypeOptions.ts) maps
// cleanly onto California's corporate-law categories without adding a new
// required question for every nonprofit founder in every state.
export function deriveCaliforniaSubtype(orgtypeRaw: string | null | undefined): NonprofitSubtype {
  const v = (orgtypeRaw || "").toLowerCase();
  if (v.includes("religious")) return "religious";
  if (v.includes("501(c)(6)") || v.includes("501(c)(7)") || v.includes("business league") || v.includes("social club")) {
    return "mutual_benefit";
  }
  return "public_benefit";
}

export async function getNonprofitStatute(state: string, subtype: NonprofitSubtype | null): Promise<NonprofitStatute | null> {
  const result = await query<{
    act_name: string;
    act_citation: string;
    statute_url: string | null;
    purpose_clause: string | null;
    dissolution_note: string | null;
    source: string;
    subtype: string | null;
  }>(
    `SELECT act_name, act_citation, statute_url, purpose_clause, dissolution_note, source, subtype
     FROM nonprofit_statutes
     WHERE state = $1 AND subtype IS NOT DISTINCT FROM $2
     LIMIT 1`,
    [state, subtype]
  );
  let row = result.rows[0];
  if (!row && subtype) {
    // No subtype-specific row (e.g. a non-CA state) — fall back to the
    // state-level (subtype IS NULL) row.
    const fallback = await query<typeof result.rows[0]>(
      `SELECT act_name, act_citation, statute_url, purpose_clause, dissolution_note, source, subtype
       FROM nonprofit_statutes
       WHERE state = $1 AND subtype IS NULL
       LIMIT 1`,
      [state]
    );
    row = fallback.rows[0];
  }
  if (!row) return null;
  return {
    actName: row.act_name,
    actCitation: row.act_citation,
    statuteUrl: row.statute_url,
    purposeClause: row.purpose_clause,
    dissolutionNote: row.dissolution_note,
    source: row.source,
  };
}
