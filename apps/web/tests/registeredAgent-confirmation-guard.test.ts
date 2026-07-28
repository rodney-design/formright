// Regression coverage for a real bug: registered-agent order status could
// jump straight to "active" with no requirement that a
// provider_confirmation_id ever exist — an order could be marked active
// with zero evidence it was actually confirmed with the provider.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));

import { updateRegisteredAgentOrder, MissingProviderConfirmationError } from "@/lib/queries/registeredAgent";

beforeEach(() => {
  queryMock.mockReset();
});

describe("updateRegisteredAgentOrder — confirmation-ID guard on 'active'", () => {
  it("rejects moving to 'active' when neither the update nor the existing row has a confirmation ID", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ provider_confirmation_id: null }] }); // getRegisteredAgentOrderById

    await expect(updateRegisteredAgentOrder("ra-1", { status: "active" })).rejects.toBeInstanceOf(
      MissingProviderConfirmationError
    );
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it("allows moving to 'active' when the confirmation ID is supplied in the same update", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: "ra-1", status: "active" }] });

    const result = await updateRegisteredAgentOrder("ra-1", { status: "active", providerConfirmationId: "NW-123" });
    expect(result).toEqual({ id: "ra-1", status: "active" });
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it("allows moving to 'active' when the row already has a confirmation ID from an earlier update", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ provider_confirmation_id: "already-set" }] });
    queryMock.mockResolvedValueOnce({ rows: [{ id: "ra-1", status: "active" }] });

    const result = await updateRegisteredAgentOrder("ra-1", { status: "active" });
    expect(result).toEqual({ id: "ra-1", status: "active" });
  });

  it("does not guard other status transitions", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: "ra-1", status: "requested" }] });
    const result = await updateRegisteredAgentOrder("ra-1", { status: "requested" });
    expect(result).toEqual({ id: "ra-1", status: "requested" });
  });
});
