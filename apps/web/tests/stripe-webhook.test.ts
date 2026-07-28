// Regression coverage for the bug fixed in PR #1: once a payment_intent.succeeded
// event has been recorded (a `payments` row exists), each post-payment side
// effect (state filing, registered agent order, confirmation email) must be
// isolated in its own try/catch. Before the fix, a single failure (e.g. the
// email send) threw out of the handler, Stripe retried, the idempotency check
// then saw the `payments` row already existed, and skipped the entire block
// on every retry — silently dropping whichever side effects hadn't run yet.
import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
const constructEventMock = vi.fn();
const ensureStateFilingMock = vi.fn();
const submitStateFilingToProviderMock = vi.fn();
const ensureRegisteredAgentOrderMock = vi.fn();
const sendRegistrationConfirmationEmailMock = vi.fn();
const captureExceptionMock = vi.fn();

const subscriptionsRetrieveMock = vi.fn();
const upsertFirmSubscriptionMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: constructEventMock },
    subscriptions: { retrieve: subscriptionsRetrieveMock },
  }),
}));
vi.mock("@/lib/email", () => ({
  sendRegistrationConfirmationEmail: sendRegistrationConfirmationEmailMock,
}));
vi.mock("@/lib/queries/stateFilings", () => ({ ensureStateFiling: ensureStateFilingMock }));
vi.mock("@/lib/state-filing/submit", () => ({ submitStateFilingToProvider: submitStateFilingToProviderMock }));
vi.mock("@/lib/queries/registeredAgent", () => ({ ensureRegisteredAgentOrder: ensureRegisteredAgentOrderMock }));
vi.mock("@/lib/queries/irsFilings", () => ({ ensureIrsFiling: vi.fn() }));
vi.mock("@/lib/queries/firmSubscriptions", () => ({ upsertFirmSubscription: upsertFirmSubscriptionMock }));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));

function makeRequest(body: string) {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "test-sig" },
    body,
  }) as unknown as import("next/server").NextRequest;
}

const REG_ID = "REG-TEST-1";

function paymentIntentSucceededEvent() {
  return {
    type: "payment_intent.succeeded",
    data: { object: { id: "pi_123", metadata: { registrationId: REG_ID } } },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  constructEventMock.mockReturnValue(paymentIntentSucceededEvent());

  queryMock.mockImplementation((sql: string) => {
    if (sql.includes("SELECT id FROM payments")) {
      return Promise.resolve({ rows: [] }); // not yet processed -> idempotency check passes
    }
    if (sql.includes("SELECT amount_cents")) {
      return Promise.resolve({
        rows: [
          {
            amount_cents: 50000,
            state_fee_cents: 9000,
            orgname: "Test Co",
            contact_email: "founder@example.com",
            state: "DE",
            notes: null,
          },
        ],
      });
    }
    return Promise.resolve({ rows: [] }); // UPDATE / INSERT
  });

  ensureStateFilingMock.mockResolvedValue(undefined);
  ensureRegisteredAgentOrderMock.mockResolvedValue(undefined);
  sendRegistrationConfirmationEmailMock.mockResolvedValue(undefined);
});

describe("Stripe webhook — payment_intent.succeeded side effects", () => {
  it("runs all side effects and returns 200 when everything succeeds", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    expect(ensureStateFilingMock).toHaveBeenCalledWith(REG_ID, "DE");
    expect(sendRegistrationConfirmationEmailMock).toHaveBeenCalledWith(
      "founder@example.com",
      "Test Co",
      REG_ID
    );
  });

  it("still creates the state filing and returns 200 when the confirmation email fails", async () => {
    sendRegistrationConfirmationEmailMock.mockRejectedValue(new Error("SendGrid down"));
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    expect(ensureStateFilingMock).toHaveBeenCalled();
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it("still sends the confirmation email and returns 200 when the state filing fails", async () => {
    ensureStateFilingMock.mockRejectedValue(new Error("state filing insert failed"));
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    expect(sendRegistrationConfirmationEmailMock).toHaveBeenCalled();
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it("does not reprocess a payment_intent that already has a payments row (idempotency)", async () => {
    queryMock.mockImplementation((sql: string) => {
      if (sql.includes("SELECT id FROM payments")) {
        return Promise.resolve({ rows: [{ id: "existing-payment" }] });
      }
      return Promise.resolve({ rows: [] });
    });
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    expect(ensureStateFilingMock).not.toHaveBeenCalled();
    expect(sendRegistrationConfirmationEmailMock).not.toHaveBeenCalled();
  });
});

// Regression coverage for a real bug: the checkout.session.completed and
// customer.subscription.* branches used to run completely unguarded, in
// sharp contrast to the extensively isolated payment_intent branch above —
// a Stripe API hiccup (or the underlying check-then-act race, now fixed
// with an atomic upsert) would throw and 500 the whole webhook with zero
// logging/visibility.
describe("Stripe webhook — subscription event isolation", () => {
  beforeEach(() => {
    subscriptionsRetrieveMock.mockResolvedValue({
      status: "active",
      metadata: { plan: "comply" },
      items: { data: [{ current_period_end: 1893456000 }] },
    });
  });

  it("does not 500 when upserting a firm seat subscription throws on checkout.session.completed", async () => {
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          subscription: "sub_123",
          metadata: { firmId: "firm-1" },
          client_reference_id: null,
        },
      },
    });
    upsertFirmSubscriptionMock.mockRejectedValue(new Error("DB unreachable"));

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it("does not 500 when the individual subscription upsert throws on customer.subscription.updated", async () => {
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: { id: "sub_456", status: "active", metadata: { userId: "user-1", plan: "comply" }, items: { data: [] } },
      },
    });
    queryMock.mockImplementation((sql: string) => {
      if (sql.includes("INSERT INTO subscriptions")) return Promise.reject(new Error("connection reset"));
      return Promise.resolve({ rows: [] });
    });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it("upserts an individual subscription via a single atomic statement, not a separate SELECT", async () => {
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: { id: "sub_789", status: "active", metadata: { userId: "user-1", plan: "comply" }, items: { data: [] } },
      },
    });
    const executed: string[] = [];
    queryMock.mockImplementation((sql: string) => {
      executed.push(sql);
      return Promise.resolve({ rows: [] });
    });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    await POST(makeRequest("{}"));

    const subscriptionQueries = executed.filter((sql) => sql.includes("subscriptions"));
    expect(subscriptionQueries).toHaveLength(1);
    expect(subscriptionQueries[0]).toContain("ON CONFLICT (stripe_subscription_id)");
  });
});
