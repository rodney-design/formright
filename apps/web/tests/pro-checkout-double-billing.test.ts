// Regression coverage for a real bug: nothing checked for an existing
// active Pro seat subscription before creating a new one — a double-click,
// browser back-button resubmit, or client retry could create two
// concurrent paid seat subscriptions for the same firm.
import { describe, it, expect, vi, beforeEach } from "vitest";

const requireFirmAdminMock = vi.fn();
const countActiveFirmMembersMock = vi.fn();
const getFirmSubscriptionMock = vi.fn();
const createSessionMock = vi.fn();

vi.mock("@/lib/queries/firms", () => ({
  requireFirmAdmin: requireFirmAdminMock,
  countActiveFirmMembers: countActiveFirmMembersMock,
}));
vi.mock("@/lib/queries/firmSubscriptions", () => ({ getFirmSubscription: getFirmSubscriptionMock }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ checkout: { sessions: { create: createSessionMock } } }),
}));

async function makeRequest() {
  const { NextRequest } = await import("next/server");
  return new NextRequest("http://localhost/api/subscriptions/pro/checkout", { method: "POST" });
}

beforeEach(() => {
  vi.clearAllMocks();
  requireFirmAdminMock.mockResolvedValue({
    user: { id: "user-1", email: "admin@example.com" },
    membership: { firm: { id: "firm-1", name: "Acme Law" }, role: "firm_admin" },
  });
  countActiveFirmMembersMock.mockResolvedValue(3);
  createSessionMock.mockResolvedValue({ url: "https://checkout.stripe.com/session_abc" });
});

describe("POST /api/subscriptions/pro/checkout — double-billing guard", () => {
  it("rejects with 409 when the firm already has an active Pro subscription", async () => {
    getFirmSubscriptionMock.mockResolvedValue({ id: "sub-1", status: "active" });

    const { POST } = await import("@/app/api/subscriptions/pro/checkout/route");
    const res = await POST(await makeRequest());
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.alreadySubscribed).toBe(true);
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("allows a new subscription when the existing one was canceled", async () => {
    getFirmSubscriptionMock.mockResolvedValue({ id: "sub-1", status: "canceled" });

    const { POST } = await import("@/app/api/subscriptions/pro/checkout/route");
    const res = await POST(await makeRequest());

    expect(res.status).toBe(200);
    expect(createSessionMock).toHaveBeenCalledTimes(1);
  });

  it("allows a new subscription when the firm has never subscribed", async () => {
    getFirmSubscriptionMock.mockResolvedValue(null);

    const { POST } = await import("@/app/api/subscriptions/pro/checkout/route");
    const res = await POST(await makeRequest());

    expect(res.status).toBe(200);
  });
});
