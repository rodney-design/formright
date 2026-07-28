// Regression coverage for a real bug: updateIrsFiling() returns null both
// when the update body was empty and when params.id doesn't match any row.
// PATCH /api/admin/irs-filings/[id] used to treat both as the same 400
// "Nothing to update", so a bad/stale filing ID silently looked like a
// client input error instead of a 404.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAdminMock, updateIrsFilingMock, uploadDocumentMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  updateIrsFilingMock: vi.fn(),
  uploadDocumentMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/queries/irsFilings", () => ({ updateIrsFiling: updateIrsFilingMock }));
vi.mock("@/lib/storage", () => ({ uploadDocument: uploadDocumentMock }));

import { PATCH } from "@/app/api/admin/irs-filings/[id]/route";

function makeRequest(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [k, v] of Object.entries(fields)) formData.set(k, v);
  return new Request("http://localhost/api/admin/irs-filings/filing-1", {
    method: "PATCH",
    body: formData,
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  requireAdminMock.mockReset().mockResolvedValue({ id: "admin-1", role: "admin" });
  updateIrsFilingMock.mockReset();
  uploadDocumentMock.mockReset();
});

describe("PATCH /api/admin/irs-filings/[id]", () => {
  it("returns 400 without calling updateIrsFiling when no fields are provided", async () => {
    const res = await PATCH(makeRequest({}), { params: { id: "filing-1" } });
    expect(res.status).toBe(400);
    expect(updateIrsFilingMock).not.toHaveBeenCalled();
  });

  it("returns 404 (not 400) when fields are provided but the filing id doesn't exist", async () => {
    updateIrsFilingMock.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ status: "submitted" }), { params: { id: "bogus" } });
    expect(res.status).toBe(404);
  });

  it("returns 200 with the updated filing when the id exists", async () => {
    updateIrsFilingMock.mockResolvedValue({ id: "filing-1", status: "submitted" });
    const res = await PATCH(makeRequest({ status: "submitted" }), { params: { id: "filing-1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.irsFiling).toEqual({ id: "filing-1", status: "submitted" });
  });
});
