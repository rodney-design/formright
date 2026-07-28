// Regression coverage for a real bug: PATCH /api/admin/registrations/[id]
// used to run its UPDATE statement(s) and always respond {ok:true},
// regardless of whether params.id matched a real row — a mistyped or stale
// registration ID silently updated zero rows and still looked like success.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryMock, requireAdminMock, getRegistrationByIdMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  requireAdminMock: vi.fn(),
  getRegistrationByIdMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@/lib/auth", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/queries/registrations", () => ({ getRegistrationById: getRegistrationByIdMock }));

import { PATCH } from "@/app/api/admin/registrations/[id]/route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/registrations/REG-1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  queryMock.mockReset();
  requireAdminMock.mockReset().mockResolvedValue({ id: "admin-1", role: "admin" });
  getRegistrationByIdMock.mockReset();
});

describe("PATCH /api/admin/registrations/[id]", () => {
  it("returns 404 and runs no UPDATE when the registration id doesn't exist", async () => {
    getRegistrationByIdMock.mockResolvedValue(null);

    const res = await PATCH(makeRequest({ status: "filed" }), { params: { id: "REG-BOGUS" } });

    expect(res.status).toBe(404);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it("returns 200 and updates when the registration exists", async () => {
    getRegistrationByIdMock.mockResolvedValue({ id: "REG-1" });
    queryMock.mockResolvedValue({ rows: [] });

    const res = await PATCH(makeRequest({ status: "filed" }), { params: { id: "REG-1" } });

    expect(res.status).toBe(200);
    expect(queryMock).toHaveBeenCalledWith("UPDATE registrations SET status = $1 WHERE id = $2", ["filed", "REG-1"]);
  });

  it("still returns 400 for an empty body before checking existence", async () => {
    const res = await PATCH(makeRequest({}), { params: { id: "REG-1" } });
    expect(res.status).toBe(400);
    expect(getRegistrationByIdMock).not.toHaveBeenCalled();
  });
});
