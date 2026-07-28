// Regression coverage for a real bug: createMagicLinkToken used to do a
// SELECT-then-branch to INSERT or UPDATE, with no transaction/locking.
// users.email is UNIQUE NOT NULL, so two concurrent requests for the same
// new email both saw "not found" and both attempted INSERT — the loser
// threw an uncaught unique-violation. These tests lock in the atomic
// INSERT ... ON CONFLICT fix: exactly one query call, no separate
// SELECT-then-branch that a future change could reintroduce the race into.
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted() (rather than a plain `const queryMock = vi.fn()`) because
// this file statically imports the module under test below — static ES
// imports execute before other top-level statements, so a plain const would
// still be in its temporal dead zone when the hoisted vi.mock factory runs.
const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));

import { createMagicLinkToken } from "@/lib/auth";

describe("createMagicLinkToken", () => {
  beforeEach(() => {
    queryMock.mockReset();
    queryMock.mockResolvedValue({ rows: [] });
  });

  it("performs a single atomic upsert, not a separate SELECT-then-branch", async () => {
    await createMagicLinkToken("founder@example.com", "Founder Name");

    expect(queryMock).toHaveBeenCalledTimes(1);
    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain("INSERT INTO users");
    expect(sql).toContain("ON CONFLICT (email)");
    expect(params).toEqual(["founder@example.com", "Founder Name", expect.any(String), expect.any(Date)]);
  });

  it("does not overwrite name on conflict — only token/expiry are updated", async () => {
    await createMagicLinkToken("existing@example.com");
    const [sql] = queryMock.mock.calls[0];
    // The ON CONFLICT clause must only touch magic_link_token/token_expiry,
    // never `name` — an existing user's name should never be clobbered by a
    // later magic-link request that didn't supply one.
    expect(sql).toMatch(/ON CONFLICT \(email\) DO UPDATE SET magic_link_token[^,]*,\s*token_expiry/);
    expect(sql).not.toMatch(/DO UPDATE SET[^;]*name\s*=/);
  });

  it("returns a fresh random token each call", async () => {
    const token1 = await createMagicLinkToken("a@example.com");
    const token2 = await createMagicLinkToken("b@example.com");
    expect(token1).not.toBe(token2);
    expect(token1).toMatch(/^[0-9a-f]{64}$/);
  });
});
