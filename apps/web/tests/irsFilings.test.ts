// Regression coverage for the same check-then-insert race fixed in
// lib/auth.ts and the users.email call sites (see auth.test.ts /
// formations-user-upsert.test.ts): ensureIrsFiling used to SELECT then
// branch to INSERT, with no transaction/locking. A retried Stripe webhook
// delivery for the same registration could call it concurrently with
// itself, both seeing "not found" and both attempting INSERT — the loser
// throwing an uncaught unique-violation once registration_id became UNIQUE.
// These tests lock in the atomic INSERT ... ON CONFLICT fix.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));

import { ensureIrsFiling } from "@/lib/queries/irsFilings";

describe("ensureIrsFiling", () => {
  beforeEach(() => {
    queryMock.mockReset();
    queryMock.mockResolvedValue({ rows: [{ id: "filing-1", registration_id: "REG-1", filing_type: "1023-ez" }] });
  });

  it("performs a single atomic upsert, not a separate SELECT-then-branch", async () => {
    await ensureIrsFiling("REG-1");

    expect(queryMock).toHaveBeenCalledTimes(1);
    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain("INSERT INTO irs_filings");
    expect(sql).toContain("ON CONFLICT (registration_id)");
    expect(params).toEqual(["REG-1", "1023-ez"]);
  });

  it("does not overwrite an existing filing's status/ein on conflict", async () => {
    await ensureIrsFiling("REG-1");
    const [sql] = queryMock.mock.calls[0];
    expect(sql).not.toMatch(/DO UPDATE SET[^;]*status\s*=/);
    expect(sql).not.toMatch(/DO UPDATE SET[^;]*ein\s*=/);
  });

  it("returns the existing row on conflict", async () => {
    const filing = await ensureIrsFiling("REG-1", "1023");
    expect(filing).toEqual({ id: "filing-1", registration_id: "REG-1", filing_type: "1023-ez" });
  });
});
