// Regression coverage for the same check-then-insert race fixed in
// lib/auth.ts and app/api/checkout/route.ts, here for the v1 partner API's
// formations endpoint — verifies the user find-or-create is a single atomic
// upsert, not a separate SELECT-then-branch that could race under
// concurrent requests for the same new client email.
import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
const requireApiKeyFirmMock = vi.fn();

vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@/lib/apiAuth", () => ({
  requireApiKeyFirm: requireApiKeyFirmMock,
  ApiAuthError: class ApiAuthError extends Error {},
  RateLimitError: class RateLimitError extends Error {
    retryAfterSeconds = 1;
  },
}));
vi.mock("@/lib/entities/stateFeesTable", () => ({
  getStateFeeForEntity: vi.fn().mockResolvedValue({ feeCents: 9000, notes: null }),
}));
vi.mock("@/lib/entities/complianceRulesTable", () => ({
  seedComplianceEventsForRegistration: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/lib/queries/stateFilings", () => ({
  ensureStateFiling: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/queries/registrations", () => ({
  getRegistrationsForFirm: vi.fn().mockResolvedValue([]),
}));

async function makeRequest(body: unknown) {
  const { NextRequest } = await import("next/server");
  return new NextRequest("http://localhost/api/v1/formations", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer test-key" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  orgname: "Test Co",
  orgtype: "llc",
  state: "Delaware",
  address: "123 Main St",
  city: "Wilmington",
  contactName: "Jane Doe",
  contactEmail: "jane@example.com",
};

const executedSql: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  executedSql.length = 0;
  requireApiKeyFirmMock.mockResolvedValue("firm-1");
  queryMock.mockImplementation((sql: string) => {
    executedSql.push(sql);
    if (sql.startsWith("INSERT INTO users")) return Promise.resolve({ rows: [{ id: "user-1" }] });
    return Promise.resolve({ rows: [] });
  });
});

describe("POST /api/v1/formations — user upsert", () => {
  it("finds-or-creates the user with a single atomic upsert, not a separate SELECT", async () => {
    const { POST } = await import("@/app/api/v1/formations/route");
    const res = await POST(await makeRequest(VALID_BODY));

    expect(res.status).toBe(201);
    const userQueries = executedSql.filter((sql) => sql.includes("users"));
    expect(userQueries).toHaveLength(1);
    expect(userQueries[0]).toContain("ON CONFLICT (email)");
    expect(executedSql.some((sql) => sql.startsWith("SELECT id FROM users"))).toBe(false);
  });
});
