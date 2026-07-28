// Regression coverage for the bug fixed in PR #1: a failed magic-link email
// send must return a clean error response instead of throwing an unhandled
// exception out of the route handler (which would 500 the request).
import { describe, it, expect, vi, beforeEach } from "vitest";

const createMagicLinkTokenMock = vi.fn();
const sendMagicLinkEmailMock = vi.fn();
const captureExceptionMock = vi.fn();

vi.mock("@/lib/auth", () => ({ createMagicLinkToken: createMagicLinkTokenMock }));
vi.mock("@/lib/email", () => ({ sendMagicLinkEmail: sendMagicLinkEmailMock }));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));

async function makeRequest(body: unknown, ip = "203.0.113.1") {
  const { NextRequest } = await import("next/server");
  return new NextRequest("http://localhost/api/auth/request-link", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  createMagicLinkTokenMock.mockResolvedValue("token-abc123");
  // Reset the module-level in-memory rate-limit bucket map between tests —
  // same pattern used in tests/rateLimit.test.ts — so one test's requests
  // don't count against another's limit.
  delete (global as { _rateLimitBuckets?: unknown })._rateLimitBuckets;
  vi.unstubAllEnvs();
});

describe("POST /api/auth/request-link", () => {
  it("returns 502 with a clean error body (not a 500 crash) when the email send fails", async () => {
    sendMagicLinkEmailMock.mockRejectedValue(new Error("SendGrid rejected the request"));

    const { POST } = await import("@/app/api/auth/request-link/route");
    const res = await POST(await makeRequest({ email: "founder@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBeTruthy();
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
  });

  // Regression for a real bug: createMagicLinkToken used to run outside the
  // try/catch that only wrapped sendMagicLinkEmail, so a DB failure here
  // (dropped connection, transient network blip) was an uncaught exception
  // producing a raw 500 instead of this route's usual clean 502 error body.
  it("returns 502 with a clean error body (not a 500 crash) when the DB call fails", async () => {
    createMagicLinkTokenMock.mockRejectedValue(new Error("Connection terminated unexpectedly"));

    const { POST } = await import("@/app/api/auth/request-link/route");
    const res = await POST(await makeRequest({ email: "founder@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBeTruthy();
    expect(sendMagicLinkEmailMock).not.toHaveBeenCalled();
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it("returns ok:true when the email send succeeds", async () => {
    sendMagicLinkEmailMock.mockResolvedValue(undefined);

    const { POST } = await import("@/app/api/auth/request-link/route");
    const res = await POST(await makeRequest({ email: "founder@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
  });

  it("rejects an invalid email before ever calling the email sender", async () => {
    const { POST } = await import("@/app/api/auth/request-link/route");
    const res = await POST(await makeRequest({ email: "not-an-email" }));

    expect(res.status).toBe(400);
    expect(sendMagicLinkEmailMock).not.toHaveBeenCalled();
  });

  // Regression for a real bug: this public, unauthenticated endpoint had no
  // rate limiting at all, unlike the v1 API key routes — an attacker could
  // flood arbitrary emails, driving SendGrid volume/cost and creating
  // unbounded `users` rows.
  describe("rate limiting", () => {
    it("returns 429 with a Retry-After header once the per-IP limit is exceeded", async () => {
      vi.stubEnv("API_RATE_LIMIT_PER_MINUTE", "2");
      sendMagicLinkEmailMock.mockResolvedValue(undefined);

      const { POST } = await import("@/app/api/auth/request-link/route");
      await POST(await makeRequest({ email: "a@example.com" }, "198.51.100.7"));
      await POST(await makeRequest({ email: "b@example.com" }, "198.51.100.7"));
      const res = await POST(await makeRequest({ email: "c@example.com" }, "198.51.100.7"));
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(res.headers.get("Retry-After")).toBeTruthy();
      expect(json.error).toBeTruthy();
      expect(createMagicLinkTokenMock).toHaveBeenCalledTimes(2); // not called for the 3rd, rate-limited request
    });

    it("tracks separate limits per client IP", async () => {
      vi.stubEnv("API_RATE_LIMIT_PER_MINUTE", "1");
      sendMagicLinkEmailMock.mockResolvedValue(undefined);

      const { POST } = await import("@/app/api/auth/request-link/route");
      const resIp1 = await POST(await makeRequest({ email: "a@example.com" }, "198.51.100.10"));
      const resIp2 = await POST(await makeRequest({ email: "b@example.com" }, "198.51.100.11"));

      expect(resIp1.status).toBe(200);
      expect(resIp2.status).toBe(200);
    });
  });
});
