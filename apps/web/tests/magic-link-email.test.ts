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

async function makeRequest(body: unknown) {
  const { NextRequest } = await import("next/server");
  return new NextRequest("http://localhost/api/auth/request-link", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  createMagicLinkTokenMock.mockResolvedValue("token-abc123");
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
});
