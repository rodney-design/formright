import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted() (rather than a plain `const queryMock = vi.fn()`) because
// this file statically imports the module under test below — static ES
// imports execute before other top-level statements, so a plain const would
// still be in its temporal dead zone when the hoisted vi.mock factory runs.
const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));

import {
  calculateAnnualReportDueDate,
  calculateForm990NDueDate,
  getComplianceRule,
  seedComplianceEventsForRegistration,
} from "@/lib/entities/complianceRulesTable";

describe("calculateAnnualReportDueDate", () => {
  it("fixed_date: rolls to next year when the deadline has already passed this year", () => {
    // Formed July 2026 — Delaware's March 1 corporate deadline already passed,
    // so the first due date should be March 1, 2027, not 2026.
    const formedAt = new Date(2026, 6, 15); // July 15, 2026
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "fixed_date", cadence: "annual", fixedMonth: 3, fixedDay: 1, offsetMonths: null, offsetDay: null, yearParity: null },
      formedAt
    );
    expect(due).toEqual(new Date(2027, 2, 1));
  });

  it("fixed_date: uses the same year when the deadline hasn't passed yet", () => {
    // Formed January 2026 — Delaware LLC's June 1 tax deadline is still ahead.
    const formedAt = new Date(2026, 0, 10);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "fixed_date", cadence: "annual", fixedMonth: 6, fixedDay: 1, offsetMonths: null, offsetDay: null, yearParity: null },
      formedAt
    );
    expect(due).toEqual(new Date(2026, 5, 1));
  });

  it("fixed_date + year_parity: rolls forward an extra cycle when the naive candidate lands on an even year (Iowa)", () => {
    // Formed June 10, 2026 (even year), Apr 1 already passed this year, so
    // the naive biennial candidate is Apr 1, 2028 — an even year, which
    // mismatches the odd-year anchor and must roll forward to 2029.
    const formedAt = new Date(2026, 5, 10); // June 10, 2026
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "fixed_date", cadence: "biennial", fixedMonth: 4, fixedDay: 1, offsetMonths: null, offsetDay: null, yearParity: "odd" },
      formedAt
    );
    expect(due).toEqual(new Date(2029, 3, 1));
  });

  it("fixed_date + year_parity: no roll-forward needed when the naive candidate already lands on an odd year", () => {
    // Formed January 10, 2027 (odd year) — Apr 1, 2027 hasn't passed yet, so
    // the naive candidate is Apr 1, 2027 itself, already an odd year.
    const formedAt = new Date(2027, 0, 10);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "fixed_date", cadence: "biennial", fixedMonth: 4, fixedDay: 1, offsetMonths: null, offsetDay: null, yearParity: "odd" },
      formedAt
    );
    expect(due).toEqual(new Date(2027, 3, 1));
  });

  it("fixed_date + biennial (no year_parity): naturally preserves the formation year's parity (Alaska)", () => {
    // Alaska's Jan 2 biennial deadline doesn't pin a fixed parity like Iowa
    // — it just files on whichever parity the entity originally formed in.
    // Plain fixed_date + biennial (no year_parity set) already produces
    // this because rolling forward by exactly 2 years never changes parity.
    const formedEven = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "fixed_date", cadence: "biennial", fixedMonth: 1, fixedDay: 2, offsetMonths: null, offsetDay: null, yearParity: null },
      new Date(2026, 5, 10) // formed in 2026, an even year
    );
    expect(formedEven).toEqual(new Date(2028, 0, 2));

    const formedOdd = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "fixed_date", cadence: "biennial", fixedMonth: 1, fixedDay: 2, offsetMonths: null, offsetDay: null, yearParity: null },
      new Date(2027, 5, 10) // formed in 2027, an odd year
    );
    expect(formedOdd).toEqual(new Date(2029, 0, 2));
  });

  it("fixed_date + year_parity 'even': Nebraska business-corporation schedule", () => {
    // Nebraska corporations file Mar 1 of even years, distinct from the
    // LLC/nonprofit odd-year Apr 1 schedule — confirms year_parity works
    // for 'even', not just the 'odd' case exercised by the Iowa tests.
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "fixed_date", cadence: "biennial", fixedMonth: 3, fixedDay: 1, offsetMonths: null, offsetDay: null, yearParity: "even" },
      new Date(2026, 5, 10) // formed June 2026 — Mar 1, 2026 already passed
    );
    expect(due).toEqual(new Date(2028, 2, 1));
  });

  it("anniversary_month_last_day + annual: last day of formation month, 1 year out", () => {
    // Formed June 10, 2026 (California corporation) — due June 30, 2027.
    const formedAt = new Date(2026, 5, 10);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "anniversary_month_last_day", cadence: "annual", fixedMonth: null, fixedDay: null, offsetMonths: null, offsetDay: null, yearParity: null },
      formedAt
    );
    expect(due).toEqual(new Date(2027, 5, 30));
  });

  it("anniversary_month_last_day + biennial: last day of formation month, 2 years out", () => {
    // Formed June 10, 2026 (California LLC) — due June 30, 2028.
    const formedAt = new Date(2026, 5, 10);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "anniversary_month_last_day", cadence: "biennial", fixedMonth: null, fixedDay: null, offsetMonths: null, offsetDay: null, yearParity: null },
      formedAt
    );
    expect(due).toEqual(new Date(2028, 5, 30));
  });

  it("anniversary_month_first_day: due on the 1st of the formation month, 1 year out (Illinois)", () => {
    // Formed September 16, 2026 — due September 1, 2027 (before the first
    // day of the anniversary month, so the deadline IS that first day).
    const formedAt = new Date(2026, 8, 16);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "anniversary_month_first_day", cadence: "annual", fixedMonth: null, fixedDay: null, offsetMonths: null, offsetDay: null, yearParity: null },
      formedAt
    );
    expect(due).toEqual(new Date(2027, 8, 1));
  });

  it("anniversary_quarter_end: due at the end of the calendar quarter containing the formation month (Wisconsin)", () => {
    // Formed May 2026 (Q2: Apr-Jun) — due June 30, 2027.
    const formedAt = new Date(2026, 4, 12);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "anniversary_quarter_end", cadence: "annual", fixedMonth: null, fixedDay: null, offsetMonths: null, offsetDay: null, yearParity: null },
      formedAt
    );
    expect(due).toEqual(new Date(2027, 5, 30));
  });

  it("anniversary_quarter_end: formation month in Q4 rolls to December 31", () => {
    // Formed November 2026 (Q4: Oct-Dec) — due December 31, 2027.
    const formedAt = new Date(2026, 10, 3);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "anniversary_quarter_end", cadence: "annual", fixedMonth: null, fixedDay: null, offsetMonths: null, offsetDay: null, yearParity: null },
      formedAt
    );
    expect(due).toEqual(new Date(2027, 11, 31));
  });

  it("anniversary_month_offset_end: due at the end of the 2nd month after the anniversary month (Colorado)", () => {
    // Formed March 2026 — anniversary month is March, due end of the 2nd
    // month following (May), 1 year out: May 31, 2027.
    const formedAt = new Date(2026, 2, 12);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "anniversary_month_offset_end", cadence: "annual", fixedMonth: null, fixedDay: null, offsetMonths: 2, offsetDay: null, yearParity: null },
      formedAt
    );
    expect(due).toEqual(new Date(2027, 4, 31));
  });

  it("anniversary_month_offset_end: rolls the calendar year forward when the offset crosses December", () => {
    // Formed November 2026 — 2nd month after November is January, which
    // rolls into 2028 (one year out from November 2027's anniversary).
    const formedAt = new Date(2026, 10, 3);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "anniversary_month_offset_end", cadence: "annual", fixedMonth: null, fixedDay: null, offsetMonths: 2, offsetDay: null, yearParity: null },
      formedAt
    );
    expect(due).toEqual(new Date(2028, 0, 31));
  });
});

describe("calculateForm990NDueDate", () => {
  it("defaults to calendar year (Dec 31) and computes May 15, not Jan 31", () => {
    // A nonprofit formed with no fiscal_year override — the IRS rule is the
    // 15th day of the 5th month after tax-year close, which for a
    // calendar-year filer is May 15 — not the Jan 31 figure that appeared in
    // an earlier (incorrect) task spec.
    const formedAt = new Date(2026, 2, 1); // March 1, 2026
    const due = calculateForm990NDueDate(null, formedAt);
    expect(due).toEqual(new Date(2027, 4, 15));
  });

  it("respects a non-calendar fiscal year end", () => {
    // Fiscal year ending June 30 -> 5th month after June is November -> Nov 15.
    const formedAt = new Date(2026, 2, 1);
    const due = calculateForm990NDueDate("June 30", formedAt);
    expect(due).toEqual(new Date(2026, 10, 15));
  });

  it("rolls to the next occurrence if the computed date has already passed", () => {
    // Fiscal year ending June 30 -> normally due Nov 15 of the same
    // formation year, but formed Dec 1 (after that Nov 15 already passed)
    // -> rolls to Nov 15 of the following year.
    const formedAt = new Date(2026, 11, 1); // December 1, 2026
    const due = calculateForm990NDueDate("June 30", formedAt);
    expect(due).toEqual(new Date(2027, 10, 15));
  });
});

// Regression coverage for the state-format bug: compliance_rules.state was
// originally seeded with two-letter codes ('DE', 'CA', ...) while
// registrations.state (and STATE_FEES) uses full names ('Delaware',
// 'California', ...), so getComplianceRule()'s query never matched anything
// at runtime. These tests exercise the actual query() call site — not just
// the pure date math above — so a future regression back to codes would
// fail here, not just silently fall back to the approximation.
describe("getComplianceRule — DB lookup uses full state names", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("queries with the full state name, not a two-letter code", async () => {
    queryMock.mockResolvedValue({ rows: [] });
    await getComplianceRule("Delaware", "llc");
    expect(queryMock).toHaveBeenCalledWith(expect.any(String), ["Delaware", "llc", "annual_report"]);
  });

  it("returns the parsed rule when a row matches the full state name", async () => {
    queryMock.mockResolvedValue({
      rows: [
        {
          not_required: false,
          rule_type: "fixed_date",
          cadence: "annual",
          fixed_month: 6,
          fixed_day: 1,
          offset_months: null,
          offset_day: null,
          year_parity: null,
          entity_family: "llc",
        },
      ],
    });
    const rule = await getComplianceRule("Delaware", "llc");
    expect(rule).toEqual({
      notRequired: false,
      ruleType: "fixed_date",
      cadence: "annual",
      fixedMonth: 6,
      fixedDay: 1,
      offsetMonths: null,
      offsetDay: null,
      yearParity: null,
    });
  });

  it("parses a year_parity value from the row (Iowa-style odd-year-anchored rule)", async () => {
    queryMock.mockResolvedValue({
      rows: [
        {
          not_required: false,
          rule_type: "fixed_date",
          cadence: "biennial",
          fixed_month: 4,
          fixed_day: 1,
          offset_months: null,
          offset_day: null,
          year_parity: "odd",
          entity_family: "all",
        },
      ],
    });
    const rule = await getComplianceRule("Iowa", "llc");
    expect(rule?.yearParity).toBe("odd");
  });

  it("returns null (falls back to approximation) when nothing matches — e.g. a two-letter code would land here", async () => {
    queryMock.mockResolvedValue({ rows: [] });
    const rule = await getComplianceRule("DE", "llc");
    expect(rule).toBeNull();
  });
});

describe("seedComplianceEventsForRegistration — end-to-end with a real state name", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("overrides the approximated annual_report date when a DB rule matches", async () => {
    queryMock.mockResolvedValue({
      rows: [
        {
          not_required: false,
          rule_type: "fixed_date",
          cadence: "annual",
          fixed_month: 6,
          fixed_day: 1,
          offset_months: null,
          offset_day: null,
          entity_family: "llc",
        },
      ],
    });
    const formedAt = new Date(2026, 0, 10); // Jan 10, 2026
    const events = await seedComplianceEventsForRegistration("llc", "Delaware", formedAt);
    const annualReport = events.find((e) => e.eventType === "annual_report");
    expect(annualReport?.dueDate).toEqual(new Date(2026, 5, 1));
  });

  it("drops the annual_report event entirely when the rule says not_required", async () => {
    queryMock.mockResolvedValue({
      rows: [
        {
          not_required: true,
          rule_type: null,
          cadence: null,
          fixed_month: null,
          fixed_day: null,
          offset_months: null,
          offset_day: null,
          entity_family: "llc",
        },
      ],
    });
    const events = await seedComplianceEventsForRegistration("llc", "South Carolina", new Date(2026, 0, 10));
    expect(events.find((e) => e.eventType === "annual_report")).toBeUndefined();
  });

  // Regression: sole proprietorships aren't a registered entity with the
  // state, so seedComplianceEvents() deliberately seeds no annual_report
  // event for "sole" — but this override function used to query
  // compliance_rules regardless of family, so a state's 'all' wildcard row
  // (e.g. Georgia/Delaware/California) would incorrectly inject one anyway.
  it("never generates an annual_report event for a sole proprietorship, even in a state with an 'all' rule", async () => {
    queryMock.mockResolvedValue({
      rows: [
        {
          not_required: false,
          rule_type: "fixed_date",
          cadence: "annual",
          fixed_month: 4,
          fixed_day: 1,
          offset_months: null,
          offset_day: null,
          entity_family: "all",
        },
      ],
    });
    const events = await seedComplianceEventsForRegistration("sole", "Georgia", new Date(2026, 0, 10));
    expect(events.find((e) => e.eventType === "annual_report")).toBeUndefined();
    expect(queryMock).not.toHaveBeenCalled();
  });
});

// getComplianceRule() now takes an eventType (default "annual_report") so
// the same compliance_rules table/query shape can serve a second obligation
// for nonprofits — charitable solicitation registration renewal — without a
// new table. See db/migrations/016_charitable_solicitation_rules.sql.
describe("seedComplianceEventsForRegistration — charitable_solicitation_renewal (nonprofit only)", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  function mockRuleFor(eventType: string, row: Record<string, unknown> | null) {
    queryMock.mockImplementation((_sql: string, params: unknown[]) => {
      const calledEventType = params[2];
      return Promise.resolve({ rows: calledEventType === eventType && row ? [row] : [] });
    });
  }

  it("adds a charitable_solicitation_renewal event when a DB rule matches", async () => {
    mockRuleFor("charitable_solicitation_renewal", {
      not_required: false,
      rule_type: "fiscal_year_offset",
      cadence: "annual",
      fixed_month: null,
      fixed_day: null,
      offset_months: 4,
      offset_day: 15,
      entity_family: "nonprofit",
    });
    const formedAt = new Date(2026, 2, 1); // March 1, 2026, default Dec 31 fiscal year end
    const events = await seedComplianceEventsForRegistration("nonprofit", "California", formedAt);
    const renewal = events.find((e) => e.eventType === "charitable_solicitation_renewal");
    // Dec (fiscal year end) + 4 months = April, day 15, next occurrence after formedAt.
    expect(renewal?.dueDate).toEqual(new Date(2027, 3, 15));
  });

  it("does not add a charitable_solicitation_renewal event when the rule says not_required (e.g. Texas/Delaware)", async () => {
    mockRuleFor("charitable_solicitation_renewal", {
      not_required: true,
      rule_type: null,
      cadence: null,
      fixed_month: null,
      fixed_day: null,
      offset_months: null,
      offset_day: null,
      entity_family: "nonprofit",
    });
    const events = await seedComplianceEventsForRegistration("nonprofit", "Texas", new Date(2026, 0, 10));
    expect(events.find((e) => e.eventType === "charitable_solicitation_renewal")).toBeUndefined();
  });

  it("does not add a charitable_solicitation_renewal event for an unseeded state", async () => {
    mockRuleFor("charitable_solicitation_renewal", null);
    const events = await seedComplianceEventsForRegistration("nonprofit", "Ohio", new Date(2026, 0, 10));
    expect(events.find((e) => e.eventType === "charitable_solicitation_renewal")).toBeUndefined();
  });

  it("never adds a charitable_solicitation_renewal event for non-nonprofit families", async () => {
    mockRuleFor("charitable_solicitation_renewal", {
      not_required: false,
      rule_type: "fiscal_year_offset",
      cadence: "annual",
      fixed_month: null,
      fixed_day: null,
      offset_months: 4,
      offset_day: 15,
      entity_family: "nonprofit",
    });
    const events = await seedComplianceEventsForRegistration("llc", "California", new Date(2026, 0, 10));
    expect(events.find((e) => e.eventType === "charitable_solicitation_renewal")).toBeUndefined();
  });
});
