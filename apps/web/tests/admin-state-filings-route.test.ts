// Regression coverage for the same two bugs fixed in the registered-agent-
// orders route (see that test file's header comment for the full
// explanation), here for PATCH /api/admin/state-filings/[id]: a bad filing
// id used to return the same 400 "Nothing to update" as an empty body
// instead of 404, and an assignment-only request returned { stateFiling: null }
// even on success.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAdminMock, updateStateFilingMock, getStateFilingByIdMock, assignContractorMock, uploadDocumentMock } = vi.hoisted(
  () => ({
    requireAdminMock: vi.fn(),
    updateStateFilingMock: vi.fn(),
    getStateFilingByIdMock: vi.fn(),
    assignContractorMock: vi.fn(),
    uploadDocumentMock: vi.fn(),
  })
);

vi.mock("@/lib/auth", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/queries/stateFilings", () => ({
  updateStateFiling: updateStateFilingMock,
  getStateFilingById: getStateFilingByIdMock,
  MissingStateConfirmationError: class MissingStateConfirmationError extends Error {},
}));
vi.mock("@/lib/queries/contractors", () => ({ assignContractorToStateFiling: assignContractorMock }));
vi.mock("@/lib/storage", () => ({ uploadDocument: uploadDocumentMock }));

import { PATCH } from "@/app/api/admin/state-filings/[id]/route";

function makeRequest(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [k, v] of Object.entries(fields)) formData.set(k, v);
  return new Request("http://localhost/api/admin/state-filings/filing-1", {
    method: "PATCH",
    body: formData,
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  requireAdminMock.mockReset().mockResolvedValue({ id: "admin-1", role: "admin" });
  updateStateFilingMock.mockReset();
  getStateFilingByIdMock.mockReset();
  assignContractorMock.mockReset();
  uploadDocumentMock.mockReset();
});

describe("PATCH /api/admin/state-filings/[id]", () => {
  it("returns 400 without any DB writes for a fully empty request", async () => {
    const res = await PATCH(makeRequest({}), { params: { id: "filing-1" } });
    expect(res.status).toBe(400);
    expect(updateStateFilingMock).not.toHaveBeenCalled();
    expect(assignContractorMock).not.toHaveBeenCalled();
  });

  it("returns 404 (not 400) when filingStatus is provided but the filing id doesn't exist", async () => {
    updateStateFilingMock.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ filingStatus: "submitted" }), { params: { id: "bogus" } });
    expect(res.status).toBe(404);
    expect(assignContractorMock).not.toHaveBeenCalled();
  });

  it("assignment-only request: returns the current filing, not null, on success", async () => {
    getStateFilingByIdMock.mockResolvedValue({ id: "filing-1", assigned_contractor_id: "contractor-1" });
    const res = await PATCH(makeRequest({ assignedContractorId: "contractor-1" }), { params: { id: "filing-1" } });

    expect(assignContractorMock).toHaveBeenCalledWith("filing-1", "contractor-1");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stateFiling).toEqual({ id: "filing-1", assigned_contractor_id: "contractor-1" });
  });

  it("assignment-only request against a bogus filing id returns 404, not a false success", async () => {
    getStateFilingByIdMock.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ assignedContractorId: "contractor-1" }), { params: { id: "bogus" } });
    expect(res.status).toBe(404);
  });

  it("returns 200 with the updated filing when a status update succeeds", async () => {
    updateStateFilingMock.mockResolvedValue({ id: "filing-1", filing_status: "submitted" });
    const res = await PATCH(makeRequest({ filingStatus: "submitted" }), { params: { id: "filing-1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stateFiling).toEqual({ id: "filing-1", filing_status: "submitted" });
  });
});
