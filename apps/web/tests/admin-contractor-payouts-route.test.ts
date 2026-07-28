// Regression coverage for a real bug: POST /api/admin/contractors/[id]/payouts
// used to call createPayout() straight through, which inserts into
// contractor_payouts whose contractor_id column is NOT NULL REFERENCES
// contractors(id) — a stale/mistyped contractor id hit that FK violation as
// an unhandled Postgres error (an opaque 500) instead of a clean 404.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAdminMock, createPayoutMock, getContractorByIdMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  createPayoutMock: vi.fn(),
  getContractorByIdMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/queries/contractors", () => ({
  createPayout: createPayoutMock,
  getContractorById: getContractorByIdMock,
}));

import { POST } from "@/app/api/admin/contractors/[id]/payouts/route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/contractors/contractor-1/payouts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  requireAdminMock.mockReset().mockResolvedValue({ id: "admin-1", role: "admin" });
  createPayoutMock.mockReset();
  getContractorByIdMock.mockReset();
});

describe("POST /api/admin/contractors/[id]/payouts", () => {
  it("returns 404 and never calls createPayout when the contractor id doesn't exist", async () => {
    getContractorByIdMock.mockResolvedValue(null);
    const res = await POST(makeRequest({ amountCents: 5000 }), { params: { id: "bogus" } });
    expect(res.status).toBe(404);
    expect(createPayoutMock).not.toHaveBeenCalled();
  });

  it("creates the payout when the contractor exists", async () => {
    getContractorByIdMock.mockResolvedValue({ id: "contractor-1" });
    createPayoutMock.mockResolvedValue({ id: "payout-1", contractor_id: "contractor-1", amount_cents: 5000 });

    const res = await POST(makeRequest({ amountCents: 5000 }), { params: { id: "contractor-1" } });
    expect(res.status).toBe(200);
    expect(createPayoutMock).toHaveBeenCalledWith("contractor-1", 5000, null);
  });

  it("still validates amountCents before checking contractor existence", async () => {
    const res = await POST(makeRequest({ amountCents: -1 }), { params: { id: "contractor-1" } });
    expect(res.status).toBe(400);
    expect(getContractorByIdMock).not.toHaveBeenCalled();
  });
});
