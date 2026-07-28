// Regression coverage for a real bug: POST /api/checkout used to fall back
// to a silent $0 state filing fee whenever getStateFeeForEntity() found no
// pricing data for the submitted state. The request schema only requires
// `state` to be a non-empty string — not one of the 50 states the
// onboarding wizard's dropdown restricts it to — so a request bypassing the
// wizard UI with a typo'd or made-up state proceeded with no state-filing
// line item at all, even though FormRight still owes that state its real
// filing fee. The checkout route must now reject the request instead of
// silently charging less than it costs to fulfill.
import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
const createSessionMock = vi.fn();
const captureExceptionMock = vi.fn();
const getStateFeeForEntityMock = vi.fn();

vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ checkout: { sessions: { create: createSessionMock } } }),
}));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));
vi.mock("@/lib/entities/stateFeesTable", () => ({ getStateFeeForEntity: getStateFeeForEntityMock }));
vi.mock("@/lib/entities/complianceRulesTable", () => ({
  seedComplianceEventsForRegistration: vi.fn().mockResolvedValue([]),
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
  state: "Nonexistentstate",
  address: "123 Main St",
  city: "Nowhere",
  fname: "Jane",
  lname: "Doe",
  email: "jane@example.com",
  planKey: "standard",
};

beforeEach(() => {
  vi.clearAllMocks();
  queryMock.mockImplementation((sql: string) => {
    if (sql.includes("SELECT id FROM users")) return Promise.resolve({ rows: [{ id: "user-1" }] });
    if (sql.startsWith("INSERT INTO users")) return Promise.resolve({ rows: [{ id: "user-1" }] });
    return Promise.resolve({ rows: [] });
  });
});

describe("POST /api/checkout — unknown state fee", () => {
  it("returns 400 and creates no registration/Stripe session when the state has no fee data", async () => {
    getStateFeeForEntityMock.mockResolvedValue(null);

    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(await makeRequest(VALID_BODY));

    expect(res.status).toBe(400);
    expect(createSessionMock).not.toHaveBeenCalled();
    expect(queryMock.mock.calls.some(([sql]) => (sql as string).startsWith("INSERT INTO registrations"))).toBe(false);
  });

  it("proceeds normally when the state does have fee data", async () => {
    getStateFeeForEntityMock.mockResolvedValue({ feeCents: 8900, notes: null });
    createSessionMock.mockResolvedValue({ url: "https://checkout.stripe.com/session_123" });

    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(await makeRequest({ ...VALID_BODY, state: "Delaware" }));

    expect(res.status).toBe(200);
  });
});
