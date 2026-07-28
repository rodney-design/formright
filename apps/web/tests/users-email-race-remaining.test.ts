// Regression coverage for the same check-then-insert race on users.email
// already fixed in lib/auth.ts, api/checkout/route.ts, and
// api/v1/formations/route.ts (see cb81ccd) — these three call sites were
// missed in that earlier pass and still did a SELECT-then-branch to INSERT,
// so two concurrent requests for the same brand-new email (two admins
// inviting/creating at once, or one double-click) could both see "not
// found" and both attempt INSERT, the loser throwing an uncaught
// unique-violation.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryMock, requireAdminMock, requireFirmAdminMock, sendFirmInviteEmailMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  requireAdminMock: vi.fn(),
  requireFirmAdminMock: vi.fn(),
  sendFirmInviteEmailMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@/lib/auth", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/queries/firms", () => ({ requireFirmAdmin: requireFirmAdminMock }));
vi.mock("@/lib/email", () => ({ sendFirmInviteEmail: sendFirmInviteEmailMock }));

function makeRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  queryMock.mockImplementation((sql: string) => {
    if (sql.startsWith("INSERT INTO users")) return Promise.resolve({ rows: [{ id: "user-1" }] });
    if (sql.startsWith("INSERT INTO firms")) return Promise.resolve({ rows: [{ id: "firm-1" }] });
    return Promise.resolve({ rows: [] });
  });
});

describe("POST /api/admin/firms — user upsert", () => {
  it("finds-or-creates the founding admin with a single atomic upsert, not a separate SELECT", async () => {
    requireAdminMock.mockResolvedValue({ id: "admin-1", role: "admin" });
    const { POST } = await import("@/app/api/admin/firms/route");

    const res = await POST(makeRequest("http://localhost/api/admin/firms", {
      name: "Acme LLC",
      adminEmail: "founder@example.com",
    }));

    expect(res.status).toBe(201);
    const userQueries = queryMock.mock.calls.filter(([sql]) => (sql as string).includes("users"));
    expect(userQueries).toHaveLength(1);
    expect(userQueries[0][0]).toContain("ON CONFLICT (email)");
    expect(queryMock.mock.calls.some(([sql]) => (sql as string).startsWith("SELECT id FROM users"))).toBe(false);
  });
});

describe("POST /api/firm/members/invite — user upsert", () => {
  it("finds-or-creates the invitee with a single atomic upsert, not a separate SELECT", async () => {
    requireFirmAdminMock.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com" },
      membership: { firm: { id: "firm-1", name: "Acme LLC" } },
    });

    const { POST } = await import("@/app/api/firm/members/invite/route");
    const res = await POST(makeRequest("http://localhost/api/firm/members/invite", { email: "new@example.com" }));

    expect(res.status).toBe(200);
    const userQueries = queryMock.mock.calls.filter(([sql]) => (sql as string).includes("INSERT INTO users") || (sql as string).startsWith("SELECT id FROM users"));
    expect(userQueries).toHaveLength(1);
    expect(userQueries[0][0]).toContain("ON CONFLICT (email)");
    expect(sendFirmInviteEmailMock).toHaveBeenCalled();
  });
});
