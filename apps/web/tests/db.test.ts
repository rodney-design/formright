import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted() so the mock factories below (hoisted above this file's
// imports by vitest) can reference these — same pattern used elsewhere in
// this test suite (see complianceRules.test.ts) for the same reason.
const { onMock, poolQueryMock, captureExceptionMock } = vi.hoisted(() => ({
  onMock: vi.fn(),
  poolQueryMock: vi.fn().mockResolvedValue({ rows: [] }),
  captureExceptionMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));
vi.mock("pg", () => ({
  Pool: class {
    on = onMock;
    query = poolQueryMock;
  },
}));

import { query } from "@/lib/db";

describe("lib/db — Postgres pool error handling", () => {
  beforeEach(() => {
    onMock.mockClear();
    poolQueryMock.mockClear();
    captureExceptionMock.mockClear();
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/test";
    // getPool() caches the pool on the real Node global object so it
    // survives hot reloads — clear it so each test exercises a fresh
    // createPool() call instead of reusing a pool from a previous test.
    delete (globalThis as { _pgPool?: unknown })._pgPool;
  });

  it("registers an 'error' listener when the pool is created", async () => {
    // BUG (fixed): node-postgres emits an 'error' event on the Pool when an
    // idle client hits a backend error or dropped connection. With no
    // listener, Node treats that as an uncaught exception and crashes the
    // whole process — not just the request using that connection. This
    // guards against that regression by asserting a handler is always wired
    // up as soon as the pool is created.
    await query("SELECT 1");
    expect(onMock).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("the registered handler reports to Sentry instead of throwing", async () => {
    await query("SELECT 1");
    const call = onMock.mock.calls.find(([event]) => event === "error");
    expect(call).toBeDefined();
    const handler = call![1] as (err: unknown) => void;
    const err = new Error("Connection terminated unexpectedly");
    expect(() => handler(err)).not.toThrow();
    expect(captureExceptionMock).toHaveBeenCalledWith(err);
  });
});
