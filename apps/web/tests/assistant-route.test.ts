// Regression coverage for a real bug: the AI assistant route had no cap on
// per-message content length and no rate limiting — a single authenticated
// user could drive unbounded Anthropic API cost in one request.
import { describe, it, expect, vi, beforeEach } from "vitest";

const getCurrentUserMock = vi.fn();
const getRegistrationsForUserMock = vi.fn();
const getComplianceEventsForUserMock = vi.fn();
const buildAssistantSystemPromptMock = vi.fn();
const streamAssistantReplyMock = vi.fn();
const captureExceptionMock = vi.fn();

vi.mock("@/lib/auth", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/queries/registrations", () => ({ getRegistrationsForUser: getRegistrationsForUserMock }));
vi.mock("@/lib/queries/complianceEvents", () => ({ getComplianceEventsForUser: getComplianceEventsForUserMock }));
vi.mock("@/lib/assistant", () => ({
  buildAssistantSystemPrompt: buildAssistantSystemPromptMock,
  streamAssistantReply: streamAssistantReplyMock,
}));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));

async function makeRequest(body: unknown) {
  const { NextRequest } = await import("next/server");
  return new NextRequest("http://localhost/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  delete (global as { _rateLimitBuckets?: unknown })._rateLimitBuckets;
  vi.unstubAllEnvs();
  getCurrentUserMock.mockResolvedValue({ id: "user-1", email: "founder@example.com" });
  getRegistrationsForUserMock.mockResolvedValue([]);
  getComplianceEventsForUserMock.mockResolvedValue([]);
  buildAssistantSystemPromptMock.mockReturnValue("system prompt");
  streamAssistantReplyMock.mockResolvedValue(new ReadableStream());
});

// Regression for a real bug: none of the context-fetch/streaming work was
// wrapped in a try/catch — streamAssistantReply() throwing synchronously
// (e.g. ANTHROPIC_API_KEY isn't set yet) was an unhandled rejection that
// fell through to Next's generic error page instead of a clean JSON error,
// with nothing reported to Sentry.
describe("POST /api/assistant — error isolation", () => {
  it("returns a clean 502 (not an unhandled crash) when streamAssistantReply throws", async () => {
    streamAssistantReplyMock.mockRejectedValue(new Error("ANTHROPIC_API_KEY is not set"));

    const { POST } = await import("@/app/api/assistant/route");
    const res = await POST(await makeRequest({ messages: [{ role: "user", content: "hi" }] }));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBeTruthy();
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it("returns a clean 502 when fetching the user's registrations/compliance context fails", async () => {
    getRegistrationsForUserMock.mockRejectedValue(new Error("DB unreachable"));

    const { POST } = await import("@/app/api/assistant/route");
    const res = await POST(await makeRequest({ messages: [{ role: "user", content: "hi" }] }));

    expect(res.status).toBe(502);
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
    expect(streamAssistantReplyMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/assistant — message length cap", () => {
  it("rejects a message over 4000 characters", async () => {
    const { POST } = await import("@/app/api/assistant/route");
    const res = await POST(await makeRequest({ messages: [{ role: "user", content: "a".repeat(4001) }] }));

    expect(res.status).toBe(400);
    expect(streamAssistantReplyMock).not.toHaveBeenCalled();
  });

  it("accepts a message at exactly the 4000-character limit", async () => {
    const { POST } = await import("@/app/api/assistant/route");
    const res = await POST(await makeRequest({ messages: [{ role: "user", content: "a".repeat(4000) }] }));

    expect(res.status).toBe(200);
    expect(streamAssistantReplyMock).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/assistant — rate limiting", () => {
  it("returns 429 once the per-user limit is exceeded", async () => {
    vi.stubEnv("API_RATE_LIMIT_PER_MINUTE", "2");

    const { POST } = await import("@/app/api/assistant/route");
    const req = () => makeRequest({ messages: [{ role: "user", content: "hi" }] });
    await POST(await req());
    await POST(await req());
    const res = await POST(await req());
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    expect(json.error).toBeTruthy();
    expect(streamAssistantReplyMock).toHaveBeenCalledTimes(2); // not called for the 3rd, rate-limited request
  });

  it("tracks separate limits per user", async () => {
    vi.stubEnv("API_RATE_LIMIT_PER_MINUTE", "1");

    const { POST } = await import("@/app/api/assistant/route");
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-a" });
    const res1 = await POST(await makeRequest({ messages: [{ role: "user", content: "hi" }] }));
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-b" });
    const res2 = await POST(await makeRequest({ messages: [{ role: "user", content: "hi" }] }));

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });
});
