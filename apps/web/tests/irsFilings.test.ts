// Regression coverage for the same check-then-insert race fixed in
// lib/auth.ts and the users.email call sites (see auth.test.ts /
// formations-user-upsert.test.ts): ensureIrsFiling used to SELECT then
// branch to INSERT, with no transaction/locking. A retried Stripe webhook
// delivery for the same registration could call it concurrently with
// itself, both seeing "not found" and both attempting INSERT — the loser
// throwing an uncaught unique-violation once registration_id became UNIQUE.
// These tests lock in the atomic INSERT ... ON CONFLICT fix.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryMock, captureExceptionMock } = vi.hoisted(() => ({ queryMock: vi.fn(), captureExceptionMock: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));

import { ensureIrsFiling, updateIrsFiling } from "@/lib/queries/irsFilings";

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

// Regression for a real bug: updateIrsFiling's registrations.ein sync used
// to run unguarded — a failure there (a DB hiccup, a stale registration_id)
// threw out of the whole function, so an admin's EIN update on irs_filings
// — which had already committed successfully — came back as a request
// failure instead of a clean success with the secondary sync isolated.
describe("updateIrsFiling — ein sync isolation", () => {
  beforeEach(() => {
    queryMock.mockReset();
    captureExceptionMock.mockReset();
  });

  it("returns the updated filing even when syncing the EIN to registrations fails", async () => {
    queryMock.mockImplementation((sql: string) => {
      if (sql.startsWith("UPDATE irs_filings")) {
        return Promise.resolve({ rows: [{ id: "filing-1", registration_id: "REG-1", ein: "12-3456789" }] });
      }
      if (sql.startsWith("UPDATE registrations")) {
        return Promise.reject(new Error("DB unreachable"));
      }
      return Promise.resolve({ rows: [] });
    });

    const updated = await updateIrsFiling("filing-1", { ein: "12-3456789" });

    expect(updated).toEqual({ id: "filing-1", registration_id: "REG-1", ein: "12-3456789" });
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it("still syncs the EIN to registrations on the normal (non-failing) path", async () => {
    queryMock.mockImplementation((sql: string) => {
      if (sql.startsWith("UPDATE irs_filings")) {
        return Promise.resolve({ rows: [{ id: "filing-1", registration_id: "REG-1", ein: "12-3456789" }] });
      }
      return Promise.resolve({ rows: [] });
    });

    await updateIrsFiling("filing-1", { ein: "12-3456789" });

    expect(queryMock).toHaveBeenCalledWith("UPDATE registrations SET ein = $1 WHERE id = $2", ["12-3456789", "REG-1"]);
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });
});
