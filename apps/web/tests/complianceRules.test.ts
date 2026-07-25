import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: vi.fn() }));

import {
  calculateAnnualReportDueDate,
  calculateForm990NDueDate,
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
