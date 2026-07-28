// Regression coverage for a real bug: the unauthenticated post-formation
// upsell path takes a 6-digit, plain-Math.random() registrationId as its
// only proof of ownership, with no rate limiting — making brute-force
// enumeration of valid registrationIds practical. This doesn't eliminate
// enumeration risk, but bounds how fast one IP can attempt it.
import { describe, it, expect, vi, beforeEach } from "vitest";

const getCurrentUserMock = vi.fn();
const getRegistrationByIdMock = vi.fn();
const createSessionMock = vi.fn();
const getSubscriptionsForUserMock = vi.fn();

vi.mock("@/lib/auth", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/queries/registrations", () => ({ getRegistrationById: getRegistrationByIdMock }));
vi.mock("@/lib/queries/subscriptions", () => ({ getSubscriptionsForUser: getSubscriptionsForUserMock }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ checkout: { sessions: { create: createSessionMock } } }),
}));

async function makeRequest(body: unknown, ip = "203.0.113.50") {
  const { NextRequest } = await import("next/server");
  return new NextRequest("http://localhost/api/subscriptions/comply/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  delete (global as { _rateLimitBuckets?: unknown })._rateLimitBuckets;
  vi.unstubAllEnvs();
  getCurrentUserMock.mockResolvedValue(null); // exercise the unauthenticated path
  createSessionMock.mockResolvedValue({ url: "https://checkout.stripe.com/session_abc" });
  getSubscriptionsForUserMock.mockResolvedValue([]);
});

describe("POST /api/subscriptions/comply/checkout — unauthenticated lookup rate limiting", () => {
  it("returns 429 once the per-IP limit on registrationId lookups is exceeded", async () => {
    vi.stubEnv("API_RATE_LIMIT_PER_MINUTE", "2");
    getRegistrationByIdMock.mockResolvedValue({ user_id: "user-1", contact_email: "victim@example.com" });

    const { POST } = await import("@/app/api/subscriptions/comply/checkout/route");
    await POST(await makeRequest({ registrationId: "FR-100001" }, "198.51.100.20"));
    await POST(await makeRequest({ registrationId: "FR-100002" }, "198.51.100.20"));
    const res = await POST(await makeRequest({ registrationId: "FR-100003" }, "198.51.100.20"));

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    // Only the 2 allowed lookups should have actually hit the DB.
    expect(getRegistrationByIdMock).toHaveBeenCalledTimes(2);
  });

  it("does not rate-limit the authenticated (logged-in) path", async () => {
    vi.stubEnv("API_RATE_LIMIT_PER_MINUTE", "1");
    getCurrentUserMock.mockResolvedValue({ id: "user-1", email: "founder@example.com" });

    const { POST } = await import("@/app/api/subscriptions/comply/checkout/route");
    const res1 = await POST(await makeRequest({}, "198.51.100.21"));
    const res2 = await POST(await makeRequest({}, "198.51.100.21"));

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(getRegistrationByIdMock).not.toHaveBeenCalled();
  });

  it("still returns 401 for an unauthenticated request with no registrationId, without consuming rate limit unnecessarily", async () => {
    const { POST } = await import("@/app/api/subscriptions/comply/checkout/route");
    const res = await POST(await makeRequest({}, "198.51.100.22"));
    expect(res.status).toBe(401);
  });
});

// Regression coverage for a real bug: nothing checked for an existing active
// Comply subscription before creating a new one — a double-click or client
// retry could create two concurrent paid subscriptions for the same user.
describe("POST /api/subscriptions/comply/checkout — double-billing guard", () => {
  it("rejects with 409 when the user already has an active Comply subscription", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "user-1", email: "founder@example.com" });
    getSubscriptionsForUserMock.mockResolvedValue([{ plan: "comply", status: "active" }]);

    const { POST } = await import("@/app/api/subscriptions/comply/checkout/route");
    const res = await POST(await makeRequest({}, "198.51.100.30"));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.alreadySubscribed).toBe(true);
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("allows a new subscription when the existing one was canceled", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "user-1", email: "founder@example.com" });
    getSubscriptionsForUserMock.mockResolvedValue([{ plan: "comply", status: "canceled" }]);

    const { POST } = await import("@/app/api/subscriptions/comply/checkout/route");
    const res = await POST(await makeRequest({}, "198.51.100.31"));

    expect(res.status).toBe(200);
    expect(createSessionMock).toHaveBeenCalledTimes(1);
  });

  it("ignores subscriptions for a different plan (e.g. 'agent')", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "user-1", email: "founder@example.com" });
    getSubscriptionsForUserMock.mockResolvedValue([{ plan: "agent", status: "active" }]);

    const { POST } = await import("@/app/api/subscriptions/comply/checkout/route");
    const res = await POST(await makeRequest({}, "198.51.100.32"));

    expect(res.status).toBe(200);
  });
});
