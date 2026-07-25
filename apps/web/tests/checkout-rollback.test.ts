// Regression coverage for the bug fixed in PR #1: when Stripe fails to create
// a checkout session, the `registrations` row already inserted for it must be
// rolled back rather than left as a permanent orphaned "pending" registration
// with no payment attached and no retry path. The rollback itself is wrapped
// in its own try/catch so a failed rollback can't hijack the response the
// client sees.
import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
const createSessionMock = vi.fn();
const captureExceptionMock = vi.fn();

vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ checkout: { sessions: { create: createSessionMock } } }),
}));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));
// stateFeesTable.ts imports the `server-only` package, which unconditionally
// throws outside of Next's own webpack build (it relies on Next swapping it
// for a no-op at bundle time, not a runtime check) — mock it out here rather
// than exercise that DB-backed lookup, which isn't what these tests are about.
vi.mock("@/lib/entities/stateFeesTable", () => ({
  getStateFeeForEntity: vi.fn().mockResolvedValue({ feeCents: 9000, notes: null }),
}));

async function makeRequest(body: unknown) {
  const { NextRequest } = await import("next/server");
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  orgname: "Test Co",
  orgtype: "llc",
  state: "Delaware",
  address: "123 Main St",
  city: "Wilmington",
  fname: "Jane",
  lname: "Doe",
  email: "jane@example.com",
  planKey: "standard",
};

const executedSql: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  executedSql.length = 0;

  queryMock.mockImplementation((sql: string) => {
    executedSql.push(sql);
    if (sql.includes("SELECT id FROM users")) return Promise.resolve({ rows: [{ id: "user-1" }] });
    if (sql.startsWith("INSERT INTO users")) return Promise.resolve({ rows: [{ id: "user-1" }] });
    return Promise.resolve({ rows: [] });
  });
});

describe("POST /api/checkout — Stripe session failure", () => {
  it("rolls back the registration and compliance rows and returns 502 when Stripe throws", async () => {
    createSessionMock.mockRejectedValue(new Error("Stripe API is down"));

    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(await makeRequest(VALID_BODY));

    expect(res.status).toBe(502);
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));

    const deletedRegistrations = executedSql.some((sql) => sql.includes("DELETE FROM registrations"));
    const deletedComplianceEvents = executedSql.some((sql) => sql.includes("DELETE FROM compliance_events"));
    expect(deletedRegistrations).toBe(true);
    expect(deletedComplianceEvents).toBe(true);
  });

  it("does not roll back and returns the session url when Stripe succeeds", async () => {
    createSessionMock.mockResolvedValue({ url: "https://checkout.stripe.com/session_123" });

    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(await makeRequest(VALID_BODY));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toBe("https://checkout.stripe.com/session_123");
    expect(executedSql.some((sql) => sql.includes("DELETE FROM registrations"))).toBe(false);
  });

  it("still returns a clean 502 (not a 500 crash) if the rollback itself fails", async () => {
    createSessionMock.mockRejectedValue(new Error("Stripe API is down"));
    queryMock.mockImplementation((sql: string) => {
      executedSql.push(sql);
      if (sql.includes("SELECT id FROM users")) return Promise.resolve({ rows: [{ id: "user-1" }] });
      if (sql.startsWith("INSERT INTO users")) return Promise.resolve({ rows: [{ id: "user-1" }] });
      if (sql.startsWith("DELETE FROM")) return Promise.reject(new Error("DB unreachable during rollback"));
      return Promise.resolve({ rows: [] });
    });

    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(await makeRequest(VALID_BODY));

    expect(res.status).toBe(502);
    // one report for the original Stripe failure, one for the failed rollback
    expect(captureExceptionMock).toHaveBeenCalledTimes(2);
  });
});
