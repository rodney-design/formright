// Route-level regression coverage for the last-admin-removal guard —
// confirms the DELETE handler surfaces LastFirmAdminError as a clean 400,
// not an uncaught exception, and doesn't touch seat billing when the
// removal was rejected.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireFirmAdminMock, removeFirmMemberMock, syncFirmSeatQuantityMock, LastFirmAdminErrorMock } = vi.hoisted(
  () => ({
    requireFirmAdminMock: vi.fn(),
    removeFirmMemberMock: vi.fn(),
    syncFirmSeatQuantityMock: vi.fn(),
    LastFirmAdminErrorMock: class LastFirmAdminError extends Error {},
  })
);

vi.mock("server-only", () => ({}));
vi.mock("@/lib/queries/firms", () => ({
  requireFirmAdmin: requireFirmAdminMock,
  removeFirmMember: removeFirmMemberMock,
  LastFirmAdminError: LastFirmAdminErrorMock,
}));
vi.mock("@/lib/queries/firmSubscriptions", () => ({ syncFirmSeatQuantity: syncFirmSeatQuantityMock }));

beforeEach(() => {
  vi.clearAllMocks();
  requireFirmAdminMock.mockResolvedValue({
    user: { id: "user-1" },
    membership: { firm: { id: "firm-1" }, role: "firm_admin" },
  });
});

describe("DELETE /api/firm/members/[id]", () => {
  it("returns a clean 400 (not a 500 crash) when removal would leave the firm with no admin", async () => {
    removeFirmMemberMock.mockRejectedValue(
      new LastFirmAdminErrorMock("Cannot remove the firm's last remaining admin")
    );

    const { DELETE } = await import("@/app/api/firm/members/[id]/route");
    const res = await DELETE(new Request("http://localhost/api/firm/members/member-1", { method: "DELETE" }), {
      params: { id: "member-1" },
    });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBeTruthy();
    expect(syncFirmSeatQuantityMock).not.toHaveBeenCalled();
  });

  it("removes the member and syncs seat quantity on success", async () => {
    removeFirmMemberMock.mockResolvedValue(true);
    syncFirmSeatQuantityMock.mockResolvedValue(undefined);

    const { DELETE } = await import("@/app/api/firm/members/[id]/route");
    const res = await DELETE(new Request("http://localhost/api/firm/members/member-2", { method: "DELETE" }), {
      params: { id: "member-2" },
    });

    expect(res.status).toBe(200);
    expect(syncFirmSeatQuantityMock).toHaveBeenCalledWith("firm-1");
  });
});
