// Regression coverage for a real bug: submitStateFilingToProvider had no
// guard against re-submitting a filing already handed off to a vendor. A
// re-run (e.g. a Stripe webhook redelivery) would duplicate the vendor
// filing and orphan webhook correlation for the original provider_filing_id.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { getFilingProviderMock, updateStateFilingMock, submitFormationMock } = vi.hoisted(() => ({
  getFilingProviderMock: vi.fn(),
  updateStateFilingMock: vi.fn(),
  submitFormationMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/state-filing/providers", () => ({ getFilingProvider: getFilingProviderMock }));
vi.mock("@/lib/queries/stateFilings", () => ({ updateStateFiling: updateStateFilingMock }));

import { submitStateFilingToProvider } from "@/lib/state-filing/submit";

const REG = {
  id: "FR-100001",
  state: "Delaware",
  entity_type: "llc",
  orgname: "Test Co",
  address: { address: "123 Main St", city: "Wilmington", zip: "19801" },
  contact_name: "Jane Doe",
  contact_email: "jane@example.com",
  notes: null,
} as never;

beforeEach(() => {
  vi.clearAllMocks();
  getFilingProviderMock.mockReturnValue({ name: "fileforms", submitFormation: submitFormationMock });
  submitFormationMock.mockResolvedValue({ providerFilingId: "vendor-filing-1" });
});

describe("submitStateFilingToProvider", () => {
  it("submits to the vendor and records the provider on a fresh manual filing", async () => {
    const filing = { id: "sf-1", state: "Delaware", provider: "manual" } as never;
    await submitStateFilingToProvider(filing, REG);

    expect(submitFormationMock).toHaveBeenCalledTimes(1);
    expect(updateStateFilingMock).toHaveBeenCalledWith("sf-1", {
      provider: "fileforms",
      providerFilingId: "vendor-filing-1",
      filingStatus: "submitted",
    });
  });

  it("does not re-submit a filing already owned by a provider", async () => {
    const filing = { id: "sf-1", state: "Delaware", provider: "fileforms" } as never;
    await submitStateFilingToProvider(filing, REG);

    expect(submitFormationMock).not.toHaveBeenCalled();
    expect(updateStateFilingMock).not.toHaveBeenCalled();
    // Shouldn't even bother looking up a provider for an already-submitted filing.
    expect(getFilingProviderMock).not.toHaveBeenCalled();
  });

  it("still no-ops when no provider covers the state, for a fresh manual filing", async () => {
    getFilingProviderMock.mockReturnValue(null);
    const filing = { id: "sf-1", state: "Wyoming", provider: "manual" } as never;
    await submitStateFilingToProvider(filing, REG);

    expect(submitFormationMock).not.toHaveBeenCalled();
    expect(updateStateFilingMock).not.toHaveBeenCalled();
  });
});
