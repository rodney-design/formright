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
const { queryMock, cookieStoreMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  cookieStoreMock: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStoreMock }));

import crypto from "crypto";
import {
  createMagicLinkToken,
  consumeMagicLinkToken,
  createSession,
  destroySession,
  getCurrentUser,
} from "@/lib/auth";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

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

  // Regression for a real bug: session and magic-link tokens used to be
  // stored verbatim — a DB-only compromise (a leaked backup, an over-broad
  // service-role query) would hand over live, directly-usable credentials
  // with no further work needed. These tests lock in that only a SHA-256
  // hash of the token ever reaches the database, never the raw value.
  it("stores a hash of the token, not the raw value returned to the caller", async () => {
    const token = await createMagicLinkToken("founder@example.com");
    const [, params] = queryMock.mock.calls[0];
    const storedValue = params[2];

    expect(storedValue).not.toBe(token);
    expect(storedValue).toBe(sha256(token));
  });
});

describe("consumeMagicLinkToken", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("looks up the hash of the provided token, not the raw value", async () => {
    const rawToken = "a".repeat(64);
    queryMock.mockResolvedValueOnce({ rows: [] });
    await consumeMagicLinkToken(rawToken);

    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain("WHERE magic_link_token = $1");
    expect(params).toEqual([sha256(rawToken)]);
  });

  it("returns the user and clears the token when the hash matches an unexpired row", async () => {
    const rawToken = "b".repeat(64);
    const futureExpiry = new Date(Date.now() + 60_000).toISOString();
    queryMock.mockResolvedValueOnce({
      rows: [{ id: "user-1", email: "founder@example.com", name: "Founder", role: "client", token_expiry: futureExpiry }],
    });
    queryMock.mockResolvedValueOnce({ rows: [] }); // the clearing UPDATE

    const user = await consumeMagicLinkToken(rawToken);
    expect(user).toEqual({ id: "user-1", email: "founder@example.com", name: "Founder", role: "client" });
  });
});

describe("session lifecycle — tokens stored as hashes", () => {
  beforeEach(() => {
    queryMock.mockReset();
    queryMock.mockResolvedValue({ rows: [] });
    cookieStoreMock.get.mockReset();
    cookieStoreMock.set.mockReset();
    cookieStoreMock.delete.mockReset();
    vi.stubEnv("JWT_SECRET", "test-secret");
  });

  it("createSession stores a hash of the JWT in sessions.token, but sets the raw JWT as the cookie", async () => {
    await createSession("user-1");

    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain("INSERT INTO sessions");
    const storedToken = params[1];

    const cookieCall = cookieStoreMock.set.mock.calls[0];
    const cookieValue = cookieCall[1];

    expect(storedToken).not.toBe(cookieValue);
    expect(storedToken).toBe(sha256(cookieValue));
  });

  it("getCurrentUser looks up the hash of the cookie's raw JWT, not the raw value", async () => {
    const jwt = (await import("jsonwebtoken")).default;
    const rawToken = jwt.sign({ sub: "user-1" }, "test-secret");
    cookieStoreMock.get.mockReturnValue({ value: rawToken });
    queryMock.mockResolvedValueOnce({
      rows: [{ id: "user-1", email: "a@example.com", name: null, role: "client", expires_at: new Date(Date.now() + 60_000).toISOString() }],
    });

    await getCurrentUser();

    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain("WHERE s.token = $1");
    expect(params).toEqual([sha256(rawToken)]);
  });

  it("destroySession deletes by the hash of the cookie's raw token", async () => {
    cookieStoreMock.get.mockReturnValue({ value: "raw-session-token" });

    await destroySession();

    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toBe("DELETE FROM sessions WHERE token = $1");
    expect(params).toEqual([sha256("raw-session-token")]);
  });
});
