import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";
import { createFileFormsProvider } from "@/lib/state-filing/providers/fileforms";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FileForms provider", () => {
  it("submits a formation and returns the vendor's filing ID", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "ff_123" }),
    });
    const provider = createFileFormsProvider("test-key", "test-secret");

    const result = await provider.submitFormation({
      registrationId: "REG-1",
      state: "DE",
      entityType: "llc",
      entityName: "Test Co LLC",
      address: { line1: "1 Main St", city: "Wilmington", zip: "19801" },
      contactEmail: "founder@example.com",
    });

    expect(result.providerFilingId).toBe("ff_123");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/formations"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      })
    );
  });

  it("throws when the vendor rejects the submission", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 422, text: async () => "bad address" });
    const provider = createFileFormsProvider("test-key", "test-secret");

    await expect(
      provider.submitFormation({
        registrationId: "REG-1",
        state: "DE",
        entityType: "llc",
        entityName: "Test Co LLC",
        address: { line1: "", city: "", zip: "" },
      })
    ).rejects.toThrow(/422/);
  });

  it("accepts a webhook signed with the shared secret", () => {
    const provider = createFileFormsProvider("test-key", "test-secret");
    const body = JSON.stringify({ filing_id: "ff_123", event: "filing.state_accepted" });
    const signature = createHmac("sha256", "test-secret").update(body).digest("hex");

    expect(provider.verifyWebhookSignature(body, signature)).toBe(true);
  });

  it("rejects a webhook with a bad or missing signature", () => {
    const provider = createFileFormsProvider("test-key", "test-secret");
    const body = JSON.stringify({ filing_id: "ff_123", event: "filing.state_accepted" });

    expect(provider.verifyWebhookSignature(body, "wrong-signature-value")).toBe(false);
    expect(provider.verifyWebhookSignature(body, null)).toBe(false);
  });

  it("maps a state-acceptance event to 'approved' with the confirmation ID", () => {
    const provider = createFileFormsProvider("test-key", "test-secret");
    const body = JSON.stringify({
      filing_id: "ff_123",
      event: "filing.state_accepted",
      state_confirmation_id: "DE-2026-000123",
    });

    expect(provider.parseWebhookEvent(body)).toEqual({
      providerFilingId: "ff_123",
      status: "approved",
      stateConfirmationId: "DE-2026-000123",
      stampedDocUrl: undefined,
    });
  });

  it("returns null for malformed or unrecognized webhook payloads", () => {
    const provider = createFileFormsProvider("test-key", "test-secret");
    expect(provider.parseWebhookEvent("not json")).toBeNull();
    expect(provider.parseWebhookEvent(JSON.stringify({ event: "filing.state_accepted" }))).toBeNull();
  });
});
