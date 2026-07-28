// Regression coverage for two real bugs in PATCH
// /api/admin/registered-agent-orders/[id]:
// 1. updateRegisteredAgentOrder() returns null both when the update body
//    had no status/providerConfirmationId fields and when params.id didn't
//    match any row — with fields actually provided, a null result must mean
//    "not found" (404), not the same 400 "Nothing to update" as an empty body.
// 2. An assignment-only request (only assignedContractorId, no status
//    fields) left `updated` null and returned { order: null } even on
//    success, and a bad id silently no-op'd the assignment UPDATE with no
//    error at all.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAdminMock, updateRegisteredAgentOrderMock, getRegisteredAgentOrderByIdMock, assignContractorMock } = vi.hoisted(
  () => ({
    requireAdminMock: vi.fn(),
    updateRegisteredAgentOrderMock: vi.fn(),
    getRegisteredAgentOrderByIdMock: vi.fn(),
    assignContractorMock: vi.fn(),
  })
);

vi.mock("@/lib/auth", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/queries/registeredAgent", () => ({
  updateRegisteredAgentOrder: updateRegisteredAgentOrderMock,
  getRegisteredAgentOrderById: getRegisteredAgentOrderByIdMock,
  MissingProviderConfirmationError: class MissingProviderConfirmationError extends Error {},
}));
vi.mock("@/lib/queries/contractors", () => ({ assignContractorToRegisteredAgentOrder: assignContractorMock }));

import { PATCH } from "@/app/api/admin/registered-agent-orders/[id]/route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/registered-agent-orders/order-1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  requireAdminMock.mockReset().mockResolvedValue({ id: "admin-1", role: "admin" });
  updateRegisteredAgentOrderMock.mockReset();
  getRegisteredAgentOrderByIdMock.mockReset();
  assignContractorMock.mockReset();
});

describe("PATCH /api/admin/registered-agent-orders/[id]", () => {
  it("returns 400 without any DB writes for a fully empty request", async () => {
    const res = await PATCH(makeRequest({}), { params: { id: "order-1" } });
    expect(res.status).toBe(400);
    expect(updateRegisteredAgentOrderMock).not.toHaveBeenCalled();
    expect(assignContractorMock).not.toHaveBeenCalled();
  });

  it("returns 404 (not 400) when status is provided but the order id doesn't exist", async () => {
    updateRegisteredAgentOrderMock.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ status: "requested" }), { params: { id: "bogus" } });
    expect(res.status).toBe(404);
    expect(assignContractorMock).not.toHaveBeenCalled();
  });

  it("assignment-only request: returns the current order, not null, on success", async () => {
    getRegisteredAgentOrderByIdMock.mockResolvedValue({ id: "order-1", assigned_contractor_id: "contractor-1" });
    updateRegisteredAgentOrderMock.mockResolvedValue(null); // no status/providerConfirmationId fields in this request
    const res = await PATCH(makeRequest({ assignedContractorId: "contractor-1" }), { params: { id: "order-1" } });

    expect(assignContractorMock).toHaveBeenCalledWith("order-1", "contractor-1");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.order).toEqual({ id: "order-1", assigned_contractor_id: "contractor-1" });
  });

  it("assignment-only request against a bogus order id returns 404, not a false success", async () => {
    getRegisteredAgentOrderByIdMock.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ assignedContractorId: "contractor-1" }), { params: { id: "bogus" } });
    expect(res.status).toBe(404);
  });

  it("returns 200 with the updated order when a status update succeeds", async () => {
    updateRegisteredAgentOrderMock.mockResolvedValue({ id: "order-1", status: "requested" });
    const res = await PATCH(makeRequest({ status: "requested" }), { params: { id: "order-1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.order).toEqual({ id: "order-1", status: "requested" });
  });
});
