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
const ensureRegisteredAgentOrderMock = vi.fn();
const sendRegistrationConfirmationEmailMock = vi.fn();
const captureExceptionMock = vi.fn();

vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ webhooks: { constructEvent: constructEventMock } }),
}));
vi.mock("@/lib/email", () => ({
  sendRegistrationConfirmationEmail: sendRegistrationConfirmationEmailMock,
}));
vi.mock("@/lib/queries/stateFilings", () => ({ ensureStateFiling: ensureStateFilingMock }));
vi.mock("@/lib/queries/registeredAgent", () => ({ ensureRegisteredAgentOrder: ensureRegisteredAgentOrderMock }));
vi.mock("@/lib/queries/firmSubscriptions", () => ({ upsertFirmSubscription: vi.fn() }));
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
