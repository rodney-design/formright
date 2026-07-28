// Regression coverage for a real bug: nothing stopped a firm_admin from
// removing the firm's last remaining admin (including themselves) — there's
// no other way to add a member to an existing firm, so a firm that loses
// its last admin is permanently locked out of self-service management.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn() }));

import { removeFirmMember, LastFirmAdminError } from "@/lib/queries/firms";

beforeEach(() => {
  queryMock.mockReset();
});

describe("removeFirmMember — last-admin guard", () => {
  it("rejects removing a firm_admin when they are the only remaining admin", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ role: "firm_admin" }] }); // target lookup
    queryMock.mockResolvedValueOnce({ rows: [{ count: "0" }] }); // other-admins count

    await expect(removeFirmMember("member-1", "firm-1")).rejects.toBeInstanceOf(LastFirmAdminError);
    // Never got as far as the actual DELETE.
    expect(queryMock).toHaveBeenCalledTimes(2);
  });

  it("allows removing a firm_admin when another admin remains", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ role: "firm_admin" }] });
    queryMock.mockResolvedValueOnce({ rows: [{ count: "1" }] });
    queryMock.mockResolvedValueOnce({ rowCount: 1 }); // the DELETE

    const result = await removeFirmMember("member-1", "firm-1");
    expect(result).toBe(true);
  });

  it("allows removing a plain firm_member without any admin-count check", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ role: "firm_member" }] });
    queryMock.mockResolvedValueOnce({ rowCount: 1 }); // the DELETE — no admin-count query in between

    const result = await removeFirmMember("member-2", "firm-1");
    expect(result).toBe(true);
    expect(queryMock).toHaveBeenCalledTimes(2);
  });
});
