import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "crypto";
import { createFileFormsProvider } from "@/lib/state-filing/providers/fileforms";

const getStateFilingByProviderFilingIdMock = vi.fn();
const updateStateFilingMock = vi.fn();
const uploadDocumentMock = vi.fn();
const captureExceptionMock = vi.fn();
const getFilingProviderByNameMock = vi.fn();

vi.mock("@/lib/queries/stateFilings", () => ({
  getStateFilingByProviderFilingId: getStateFilingByProviderFilingIdMock,
  updateStateFiling: updateStateFilingMock,
}));
vi.mock("@/lib/storage", () => ({ uploadDocument: uploadDocumentMock }));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));
// The real module imports "server-only", which throws under vitest's plain
// node environment (no "react-server" export condition set) — mocked here
// the same way lib/db and lib/stripe are mocked elsewhere in this suite. The
// real createFileFormsProvider is used underneath so signature verification
// and event parsing are still exercised for real, not stubbed away.
vi.mock("@/lib/state-filing/providers", () => ({
  getFilingProviderByName: (...args: unknown[]) => getFilingProviderByNameMock(...args),
}));

const WEBHOOK_SECRET = "test-secret";

function signedRequest(body: string) {
  const signature = createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
  return new Request("http://localhost/api/webhooks/fileforms", {
    method: "POST",
    headers: { "x-fileforms-signature": signature },
    body,
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  getFilingProviderByNameMock.mockImplementation((name: string) =>
    name === "fileforms" ? createFileFormsProvider("test-key", WEBHOOK_SECRET) : null
  );
  getStateFilingByProviderFilingIdMock.mockResolvedValue({ id: "filing-row-1" });
  updateStateFilingMock.mockResolvedValue({ id: "filing-row-1" });
});

describe("POST /api/webhooks/fileforms", () => {
  it("updates the matching state filing when the state accepts the filing", async () => {
    const body = JSON.stringify({
      filing_id: "ff_123",
      event: "filing.state_accepted",
      state_confirmation_id: "DE-2026-000123",
    });
    const { POST } = await import("@/app/api/webhooks/fileforms/route");
    const res = await POST(signedRequest(body));

    expect(res.status).toBe(200);
    expect(getStateFilingByProviderFilingIdMock).toHaveBeenCalledWith("fileforms", "ff_123");
    expect(updateStateFilingMock).toHaveBeenCalledWith("filing-row-1", {
      filingStatus: "approved",
      stateConfirmationId: "DE-2026-000123",
      stampedDocS3Key: undefined,
    });
  });

  it("rejects a request with an invalid signature", async () => {
    const body = JSON.stringify({ filing_id: "ff_123", event: "filing.state_accepted" });
    const req = new Request("http://localhost/api/webhooks/fileforms", {
      method: "POST",
      headers: { "x-fileforms-signature": "not-the-right-signature" },
      body,
    }) as unknown as import("next/server").NextRequest;

    const { POST } = await import("@/app/api/webhooks/fileforms/route");
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(updateStateFilingMock).not.toHaveBeenCalled();
  });

  it("404s when no state filing matches the vendor's filing ID", async () => {
    getStateFilingByProviderFilingIdMock.mockResolvedValue(null);
    const body = JSON.stringify({ filing_id: "ff_unknown", event: "filing.state_accepted" });

    const { POST } = await import("@/app/api/webhooks/fileforms/route");
    const res = await POST(signedRequest(body));

    expect(res.status).toBe(404);
    expect(updateStateFilingMock).not.toHaveBeenCalled();
  });

  it("503s when no provider is configured", async () => {
    getFilingProviderByNameMock.mockReturnValue(null);
    const body = JSON.stringify({ filing_id: "ff_123", event: "filing.state_accepted" });

    const { POST } = await import("@/app/api/webhooks/fileforms/route");
    const res = await POST(signedRequest(body));

    expect(res.status).toBe(503);
  });
});
