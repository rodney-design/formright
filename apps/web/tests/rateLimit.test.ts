import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, RateLimitError } from "@/lib/rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Reset the module-level in-memory bucket map between tests.
    delete (global as { _rateLimitBuckets?: unknown })._rateLimitBuckets;
    vi.unstubAllEnvs();
  });

  it("allows up to the configured limit, then throws on the next call", () => {
    vi.stubEnv("API_RATE_LIMIT_PER_MINUTE", "5");
    for (let i = 0; i < 5; i++) {
      expect(() => checkRateLimit("firm-a")).not.toThrow();
    }
    expect(() => checkRateLimit("firm-a")).toThrow(RateLimitError);
  });

  it("reports a positive retryAfterSeconds on the 429 path", () => {
    vi.stubEnv("API_RATE_LIMIT_PER_MINUTE", "1");
    checkRateLimit("firm-b");
    try {
      checkRateLimit("firm-b");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("tracks separate buckets per key", () => {
    vi.stubEnv("API_RATE_LIMIT_PER_MINUTE", "1");
    checkRateLimit("firm-c");
    expect(() => checkRateLimit("firm-d")).not.toThrow();
  });

  it("defaults to 100/minute when the env var is unset", () => {
    for (let i = 0; i < 100; i++) {
      expect(() => checkRateLimit("firm-e")).not.toThrow();
    }
    expect(() => checkRateLimit("firm-e")).toThrow(RateLimitError);
  });
});
