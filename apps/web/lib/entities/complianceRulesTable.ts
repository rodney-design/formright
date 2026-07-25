// Compliance rules engine (System 3) — data-driven per-state annual-report
// due dates, replacing the formation-anniversary approximation in
// seedComplianceEvents() for states with a verified rule. See
// db/migrations/007_compliance_rules.sql (DE/CA/FL/NY/TX) and
// db/migrations/008_compliance_rules_northeast_midatlantic.sql for sourcing.
// Split from complianceEvents.ts (rather than adding a DB call there) for
// the same reason as stateFeesTable.ts/stateFees.ts: keeps the pure fallback
// importable from contexts that shouldn't pull in `pg`.
import "server-only";
import { query } from "@/lib/db";
import type { EntityFamily } from "./entityFamily";
import { seedComplianceEvents, type ComplianceEventSeed } from "./complianceEvents";

type RuleType =
  | "fixed_date"
  | "anniversary_month_last_day"
  | "anniversary_exact_date"
  | "fiscal_year_offset"
  | "anniversary_month_first_day" // due on the 1st of the formation month, not the last day (Illinois)
  | "anniversary_quarter_end"     // due at the end of the calendar quarter containing the formation month (Wisconsin)
  | "anniversary_month_offset_end"; // due at the end of the Nth month after the formation month (offsetMonths) — Colorado's "end of the 2nd month following the anniversary month"
type Cadence = "annual" | "biennial";
type YearParity = "odd" | "even";

export interface ComplianceRule {
  notRequired: boolean;
  ruleType: RuleType | null;
  cadence: Cadence | null;
  fixedMonth: number | null;
  fixedDay: number | null;
  offsetMonths: number | null;
  offsetDay: number | null; // null under fiscal_year_offset means "last day of the target month"
  // Only meaningful with rule_type = 'fixed_date': some states run a fixed
  // biennial filing calendar anchored to odd/even calendar years rather than
  // "2 years after formation" (Iowa: always April 1 of an odd year,
  // regardless of formation year parity). When set, the computed candidate
  // rolls forward a year until its year matches this parity.
  yearParity: YearParity | null;
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
    not_required: boolean;
    rule_type: RuleType | null;
    cadence: Cadence | null;
    fixed_month: number | null;
    fixed_day: number | null;
    offset_months: number | null;
    offset_day: number | null;
    year_parity: YearParity | null;
    entity_family: string;
  }>(
    `SELECT not_required, rule_type, cadence, fixed_month, fixed_day, offset_months, offset_day, year_parity, entity_family
     FROM compliance_rules
     WHERE state = $1 AND entity_family IN ($2, 'all') AND event_type = 'annual_report'
     ORDER BY (entity_family = $2) DESC
     LIMIT 1`,
    [state, family]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    notRequired: row.not_required,
    ruleType: row.rule_type,
    cadence: row.cadence,
    fixedMonth: row.fixed_month,
    fixedDay: row.fixed_day,
    offsetMonths: row.offset_months,
    offsetDay: row.offset_day,
    yearParity: row.year_parity,
  };
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

// Shared "N months after a given month, landing on day D (or the last day of
// that month when D is null), rolled forward a year if already passed"
// calculator — the same shape as the pre-existing Form 990-N math below, now
// generalized for state corporate filings tied to fiscal year end rather
// than a fixed calendar date (MA/NC/SC corporations, VT all entities).
function calculateFiscalYearOffsetDate(
  fyEndMonth: number, // 0-indexed
  offsetMonths: number,
  offsetDay: number | null,
  formedAt: Date
): Date {
  const dueMonthTotal = fyEndMonth + offsetMonths;
  const dueMonth = dueMonthTotal % 12;
  const yearOffset = Math.floor(dueMonthTotal / 12);

  const build = (year: number) =>
    offsetDay == null ? new Date(year, dueMonth + 1, 0) : new Date(year, dueMonth, offsetDay);

  let dueYear = formedAt.getFullYear() + yearOffset;
  let candidate = build(dueYear);
  if (candidate <= formedAt) {
    dueYear = formedAt.getFullYear() + 1 + yearOffset;
    candidate = build(dueYear);
  }
  return candidate;
}

// Pure — the actual date math, kept separate from the DB lookup so it's
// unit-testable without a database. Returns null when the rule says the
// event doesn't apply (notRequired) — caller should skip generating an
// annual_report event entirely rather than falling back to a guess.
export function calculateAnnualReportDueDate(
  rule: ComplianceRule,
  formedAt: Date,
  fiscalYearLabel?: string | null
): Date | null {
  if (rule.notRequired) return null;

  if (rule.ruleType === "fixed_date") {
    if (rule.fixedMonth == null || rule.fixedDay == null) {
      throw new Error("fixed_date rule missing fixedMonth/fixedDay");
    }
    const cadenceYears = rule.cadence === "biennial" ? 2 : 1;
    let candidate = new Date(formedAt.getFullYear(), rule.fixedMonth - 1, rule.fixedDay);
    if (candidate <= formedAt) {
      candidate = new Date(formedAt.getFullYear() + cadenceYears, rule.fixedMonth - 1, rule.fixedDay);
    }
    if (rule.yearParity) {
      while (isYearParityMismatch(candidate.getFullYear(), rule.yearParity)) {
        candidate = new Date(candidate.getFullYear() + 1, rule.fixedMonth - 1, rule.fixedDay);
      }
    }
    return candidate;
  }

  if (rule.ruleType === "anniversary_month_last_day") {
    // Due on the last day of the formation month, 1 year out (annual) or 2
    // years out (biennial). `new Date(y, m+1, 0)` is the standard "last day
    // of month m" trick (day 0 of the following month).
    const yearsOut = rule.cadence === "biennial" ? 2 : 1;
    return new Date(formedAt.getFullYear() + yearsOut, formedAt.getMonth() + 1, 0);
  }

  if (rule.ruleType === "anniversary_month_first_day") {
    // Due on the 1st of the formation month, 1 year out (Illinois: filed
    // "before the first day of the anniversary month," so the deadline IS
    // that first day) — contrast with anniversary_month_last_day above.
    const yearsOut = rule.cadence === "biennial" ? 2 : 1;
    return new Date(formedAt.getFullYear() + yearsOut, formedAt.getMonth(), 1);
  }

  if (rule.ruleType === "anniversary_quarter_end") {
    // Due on the last day of the calendar quarter containing the formation
    // month, 1 year out (Wisconsin). Quarter-end month index: Q1->Feb(1)
    // isn't right — quarters are Jan-Mar/Apr-Jun/Jul-Sep/Oct-Dec, so the
    // last month of the formation month's quarter is
    // floor(month/3)*3 + 2 (0-indexed: Mar=2, Jun=5, Sep=8, Dec=11).
    const yearsOut = rule.cadence === "biennial" ? 2 : 1;
    const quarterEndMonth = Math.floor(formedAt.getMonth() / 3) * 3 + 2;
    return new Date(formedAt.getFullYear() + yearsOut, quarterEndMonth + 1, 0);
  }

  if (rule.ruleType === "anniversary_month_offset_end") {
    // Due on the last day of the Nth month after the formation month, 1
    // year out (Colorado: "end of the second month following the
    // anniversary month" -> offsetMonths = 2). Unlike fiscal_year_offset,
    // this counts from the formation month itself, not a fiscal year end,
    // so it doesn't go through calculateFiscalYearOffsetDate.
    if (rule.offsetMonths == null) {
      throw new Error("anniversary_month_offset_end rule missing offsetMonths");
    }
    const yearsOut = rule.cadence === "biennial" ? 2 : 1;
    const totalMonth = formedAt.getMonth() + rule.offsetMonths;
    const year = formedAt.getFullYear() + yearsOut + Math.floor(totalMonth / 12);
    const month = ((totalMonth % 12) + 12) % 12;
    return rule.offsetDay == null ? new Date(year, month + 1, 0) : new Date(year, month, rule.offsetDay);
  }

  if (rule.ruleType === "anniversary_exact_date") {
    // Due on the exact calendar date of formation, 1 year out (e.g.
    // Massachusetts LLCs — not month-end, the literal anniversary).
    const yearsOut = rule.cadence === "biennial" ? 2 : 1;
    return new Date(formedAt.getFullYear() + yearsOut, formedAt.getMonth(), formedAt.getDate());
  }

  if (rule.ruleType === "fiscal_year_offset") {
    if (rule.offsetMonths == null) {
      throw new Error("fiscal_year_offset rule missing offsetMonths");
    }
    const fyEndMonth = parseFiscalYearEndMonth(fiscalYearLabel);
    return calculateFiscalYearOffsetDate(fyEndMonth, rule.offsetMonths, rule.offsetDay, formedAt);
  }

  throw new Error(`Unhandled compliance rule type: ${rule.ruleType}`);
}

function isYearParityMismatch(year: number, parity: YearParity): boolean {
  const isOdd = year % 2 !== 0;
  return parity === "odd" ? !isOdd : isOdd;
}

// IRS Form 990-N (e-Postcard): due the 15th day of the 5th month after the
// close of the organization's tax year. Not eligible for extension. For a
// calendar-year org that's May 15 — NOT January 31 (a figure that appeared
// in an earlier task spec but doesn't match the IRS rule; verified against
// irs.gov/charities-non-profits/annual-electronic-notice-form-990-n-frequently-asked-questions).
// Federal, not state-specific, so this doesn't live in compliance_rules.
export function calculateForm990NDueDate(fiscalYearLabel: string | null | undefined, formedAt: Date): Date {
  const fyEndMonth = parseFiscalYearEndMonth(fiscalYearLabel);
  return calculateFiscalYearOffsetDate(fyEndMonth, 5, 15, formedAt);
}

// State-aware entry point used by registration creation (checkout, /api/v1/formations).
// Starts from seedComplianceEvents()'s baseline (2553 election, benefit report,
// the anniversary-approximated annual_report), then:
//  - overrides annual_report with the verified per-state due date when a
//    compliance_rules row exists for (state, family) — or removes it
//    entirely when the rule says the state doesn't require one — otherwise
//    the approximation stands;
//  - adds a 990-N event for nonprofits, computed from the registration's
//    actual fiscal year rather than assuming a fixed date.
export async function seedComplianceEventsForRegistration(
  family: EntityFamily,
  state: string,
  formedAt: Date,
  fiscalYearLabel?: string | null
): Promise<ComplianceEventSeed[]> {
  const events = seedComplianceEvents(family, formedAt);

  // Sole proprietorships aren't a registered entity with the state — there's
  // no annual report/renewal to have a deadline for, which is why
  // seedComplianceEvents() above already returns no events for "sole". Skip
  // the rule lookup entirely for this family so a state's 'all' wildcard row
  // (matched by every OTHER family) can't incorrectly inject one anyway.
  const rule = family === "sole" ? null : await getComplianceRule(state, family);
  if (rule) {
    const dueDate = calculateAnnualReportDueDate(rule, formedAt, fiscalYearLabel);
    const idx = events.findIndex((e) => e.eventType === "annual_report");
    if (dueDate === null) {
      if (idx >= 0) events.splice(idx, 1);
    } else if (idx >= 0) {
      events[idx] = { eventType: "annual_report", dueDate };
    } else {
      events.push({ eventType: "annual_report", dueDate });
    }
  }

  if (family === "nonprofit") {
    events.push({
      eventType: "990n",
      dueDate: calculateForm990NDueDate(fiscalYearLabel, formedAt),
    });
  }

  return events;
}
