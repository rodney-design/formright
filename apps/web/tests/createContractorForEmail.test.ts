// Regression coverage for the same check-then-insert race fixed elsewhere
// (see users-email-race-remaining.test.ts) — createContractorForEmail had
// two separate instances: one on users.email, one on contractors.user_id
// (both UNIQUE). Two concurrent invites for the same brand-new contractor
// email could each race either step and throw an uncaught unique-violation.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));

import { createContractorForEmail } from "@/lib/queries/contractors";

describe("createContractorForEmail", () => {
  beforeEach(() => {
    queryMock.mockReset();
    queryMock.mockImplementation((sql: string) => {
      if (sql.startsWith("INSERT INTO users")) return Promise.resolve({ rows: [{ id: "user-1" }] });
      if (sql.startsWith("INSERT INTO contractors")) {
        return Promise.resolve({ rows: [{ id: "contractor-1", user_id: "user-1", states_covered: [] }] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  it("upserts the user atomically — a single INSERT ... ON CONFLICT, no separate SELECT", async () => {
    await createContractorForEmail("new@example.com", "New Contractor", ["Delaware"]);

    const userQueries = queryMock.mock.calls.filter(
      ([sql]) => (sql as string).includes("users") && !(sql as string).includes("contractors")
    );
    expect(userQueries).toHaveLength(1);
    expect(userQueries[0][0]).toContain("ON CONFLICT (email)");
    expect(userQueries[0][0]).toContain("THEN 'contractor'");
  });

  it("only promotes an existing 'client' role — the CASE never touches admin/super_admin", async () => {
    await createContractorForEmail("new@example.com", undefined, []);
    const [sql] = queryMock.mock.calls[0];
    expect(sql).toMatch(/CASE WHEN users\.role = 'client' THEN 'contractor' ELSE users\.role END/);
  });

  it("upserts the contractors row atomically — a single INSERT ... ON CONFLICT, no separate SELECT-then-insert", async () => {
    await createContractorForEmail("new@example.com", undefined, ["Texas"]);

    const contractorQueries = queryMock.mock.calls.filter(([sql]) => (sql as string).includes("INSERT INTO contractors"));
    expect(contractorQueries).toHaveLength(1);
    expect(contractorQueries[0][0]).toContain("ON CONFLICT (user_id)");
    expect(contractorQueries[0][1]).toEqual(["user-1", ["Texas"]]);
  });

  it("returns the contractor row from the upsert", async () => {
    const contractor = await createContractorForEmail("new@example.com", undefined, []);
    expect(contractor).toEqual({ id: "contractor-1", user_id: "user-1", states_covered: [] });
  });
});
