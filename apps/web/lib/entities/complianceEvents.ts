import type { EntityFamily } from "./entityFamily";

export interface ComplianceEventSeed {
  eventType: string;
  dueDate: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Entity-type-driven compliance triggers (build-order doc §Phase 2 step 5,
// brief §8.2 — "annual benefit report for Benefit Corps, Form 2553 election
// deadline for S-Corps"). Deliberately conservative: only seeds events with
// a clear, entity-type-wide statutory basis, using the formation date as the
// anchor. Many states actually tie the annual report to a fixed calendar
// date rather than the formation anniversary — that state-specific due-date
// logic isn't modeled yet, so this is an approximation until it is.
export function seedComplianceEvents(family: EntityFamily, formedAt: Date): ComplianceEventSeed[] {
  const oneYear = new Date(formedAt.getTime());
  oneYear.setFullYear(oneYear.getFullYear() + 1);

  switch (family) {
    case "llc":
    case "ccorp":
    case "pc":
      return [{ eventType: "annual_report", dueDate: oneYear }];
    case "scorp":
      // IRC §1362(b): election must be filed within 75 days of formation
      // (or the start of the tax year it's to take effect) to be timely.
      return [
        { eventType: "annual_report", dueDate: oneYear },
        { eventType: "2553_deadline", dueDate: new Date(formedAt.getTime() + 75 * DAY_MS) },
      ];
    case "benefit":
      return [
        { eventType: "annual_report", dueDate: oneYear },
        { eventType: "benefit_report", dueDate: oneYear },
      ];
    case "nonprofit":
      return [{ eventType: "annual_report", dueDate: oneYear }];
    case "sole":
      // No entity-wide statutory deadline to seed — DBA/license renewal
      // cadence is too state/county-specific to default safely.
      return [];
    default:
      return [];
  }
}
