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
      { notRequired: false, ruleType: "fixed_date", cadence: "annual", fixedMonth: 3, fixedDay: 1, offsetMonths: null, offsetDay: null },
      formedAt
    );
    expect(due).toEqual(new Date(2027, 2, 1));
  });

  it("fixed_date: uses the same year when the deadline hasn't passed yet", () => {
    // Formed January 2026 — Delaware LLC's June 1 tax deadline is still ahead.
    const formedAt = new Date(2026, 0, 10);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "fixed_date", cadence: "annual", fixedMonth: 6, fixedDay: 1, offsetMonths: null, offsetDay: null },
      formedAt
    );
    expect(due).toEqual(new Date(2026, 5, 1));
  });

  it("anniversary_month_last_day + annual: last day of formation month, 1 year out", () => {
    // Formed June 10, 2026 (California corporation) — due June 30, 2027.
    const formedAt = new Date(2026, 5, 10);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "anniversary_month_last_day", cadence: "annual", fixedMonth: null, fixedDay: null, offsetMonths: null, offsetDay: null },
      formedAt
    );
    expect(due).toEqual(new Date(2027, 5, 30));
  });

  it("anniversary_month_last_day + biennial: last day of formation month, 2 years out", () => {
    // Formed June 10, 2026 (California LLC) — due June 30, 2028.
    const formedAt = new Date(2026, 5, 10);
    const due = calculateAnnualReportDueDate(
      { notRequired: false, ruleType: "anniversary_month_last_day", cadence: "biennial", fixedMonth: null, fixedDay: null, offsetMonths: null, offsetDay: null },
      formedAt
    );
    expect(due).toEqual(new Date(2028, 5, 30));
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
    expect(queryMock).toHaveBeenCalledWith(expect.any(String), ["Delaware", "llc"]);
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
    });
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
});
