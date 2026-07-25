// Compliance rules engine (System 3) — data-driven per-state annual-report
// due dates for the 5 priority states, replacing the formation-anniversary
// approximation in seedComplianceEvents() for states with a verified rule.
// See db/migrations/007_compliance_rules.sql for sourcing. Split from
// complianceEvents.ts (rather than adding a DB call there) for the same
// reason as stateFeesTable.ts/stateFees.ts: keeps the pure fallback
// importable from contexts that shouldn't pull in `pg`.
import "server-only";
import { query } from "@/lib/db";
import type { EntityFamily } from "./entityFamily";
import { seedComplianceEvents, type ComplianceEventSeed } from "./complianceEvents";

type RuleType = "fixed_date" | "anniversary_month_last_day";
type Cadence = "annual" | "biennial";

export interface ComplianceRule {
  ruleType: RuleType;
  cadence: Cadence;
  fixedMonth: number | null;
  fixedDay: number | null;
}

// Exact entity_family match wins; 'all' is the wildcard fallback within the
// same state (see migration 007's comment on why most states need only one
// row). No row for the state at all means "no verified rule" — caller falls
// back to the anniversary approximation.
export async function getComplianceRule(
  state: string,
  family: EntityFamily
): Promise<ComplianceRule | null> {
  const result = await query<{
    rule_type: RuleType;
    cadence: Cadence;
    fixed_month: number | null;
    fixed_day: number | null;
    entity_family: string;
  }>(
    `SELECT rule_type, cadence, fixed_month, fixed_day, entity_family
     FROM compliance_rules
     WHERE state = $1 AND entity_family IN ($2, 'all') AND event_type = 'annual_report'
     ORDER BY (entity_family = $2) DESC
     LIMIT 1`,
    [state, family]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ruleType: row.rule_type,
    cadence: row.cadence,
    fixedMonth: row.fixed_month,
    fixedDay: row.fixed_day,
  };
}

// Pure — the actual date math, kept separate from the DB lookup so it's
// unit-testable without a database.
export function calculateAnnualReportDueDate(rule: ComplianceRule, formedAt: Date): Date {
  if (rule.ruleType === "fixed_date") {
    if (rule.fixedMonth == null || rule.fixedDay == null) {
      throw new Error("fixed_date rule missing fixedMonth/fixedDay");
    }
    let candidate = new Date(formedAt.getFullYear(), rule.fixedMonth - 1, rule.fixedDay);
    if (candidate <= formedAt) {
      candidate = new Date(formedAt.getFullYear() + 1, rule.fixedMonth - 1, rule.fixedDay);
    }
    return candidate;
  }

  // anniversary_month_last_day: due on the last day of the formation month,
  // 1 year out (annual) or 2 years out (biennial). `new Date(y, m+1, 0)` is
  // the standard "last day of month m" trick (day 0 of the following month).
  const yearsOut = rule.cadence === "biennial" ? 2 : 1;
  return new Date(formedAt.getFullYear() + yearsOut, formedAt.getMonth() + 1, 0);
}

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

// registrations.fiscal_year is free text (e.g. "December 31", the default
// from orgDataFromRegistration.ts) — parse the leading month name, or
// default to calendar year (December) same as that existing default.
function parseFiscalYearEndMonth(fiscalYearLabel: string | null | undefined): number {
  const label = (fiscalYearLabel || "").trim().toLowerCase();
  const idx = MONTH_NAMES.findIndex((m) => label.startsWith(m));
  return idx === -1 ? 11 : idx; // 0-indexed; default December = 11
}

// IRS Form 990-N (e-Postcard): due the 15th day of the 5th month after the
// close of the organization's tax year. Not eligible for extension. For a
// calendar-year org that's May 15 — NOT January 31 (a figure that appeared
// in an earlier task spec but doesn't match the IRS rule; verified against
// irs.gov/charities-non-profits/annual-electronic-notice-form-990-n-frequently-asked-questions).
export function calculateForm990NDueDate(fiscalYearLabel: string | null | undefined, formedAt: Date): Date {
  const fyEndMonth = parseFiscalYearEndMonth(fiscalYearLabel); // 0-indexed
  const dueMonthTotal = fyEndMonth + 5; // 5th month after fiscal year end
  const dueMonth = dueMonthTotal % 12;
  const yearOffset = Math.floor(dueMonthTotal / 12);

  let dueYear = formedAt.getFullYear() + yearOffset;
  let candidate = new Date(dueYear, dueMonth, 15);
  if (candidate <= formedAt) {
    dueYear = formedAt.getFullYear() + 1 + yearOffset;
    candidate = new Date(dueYear, dueMonth, 15);
  }
  return candidate;
}

// State-aware entry point used by registration creation (checkout, /api/v1/formations).
// Starts from seedComplianceEvents()'s baseline (2553 election, benefit report,
// the anniversary-approximated annual_report), then:
//  - overrides annual_report with the verified per-state due date when a
//    compliance_rules row exists for (state, family) — otherwise the
//    approximation stands;
//  - adds a 990-N event for nonprofits, computed from the registration's
//    actual fiscal year rather than assuming a fixed date.
export async function seedComplianceEventsForRegistration(
  family: EntityFamily,
  state: string,
  formedAt: Date,
  fiscalYearLabel?: string | null
): Promise<ComplianceEventSeed[]> {
  const events = seedComplianceEvents(family, formedAt);

  const rule = await getComplianceRule(state, family);
  if (rule) {
    const dueDate = calculateAnnualReportDueDate(rule, formedAt);
    const idx = events.findIndex((e) => e.eventType === "annual_report");
    if (idx >= 0) events[idx] = { eventType: "annual_report", dueDate };
    else events.push({ eventType: "annual_report", dueDate });
  }

  if (family === "nonprofit") {
    events.push({
      eventType: "990n",
      dueDate: calculateForm990NDueDate(fiscalYearLabel, formedAt),
    });
  }

  return events;
}
