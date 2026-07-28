// No "server-only" import here (unlike most of lib/) so this stays easily
// unit-testable under vitest, which throws on that marker package outside a
// Next.js server-component build — see tests/rateLimit.test.ts. In practice
// it's only ever reached from lib/apiAuth.ts (itself "server-only") or a
// route.ts handler, both inherently server-side.
const WINDOW_MS = 60_000;
const DEFAULT_LIMIT_PER_MINUTE = 100;

declare global {
  // eslint-disable-next-line no-var
  var _rateLimitBuckets: Map<string, number[]> | undefined;
}

function getBuckets(): Map<string, number[]> {
  if (!global._rateLimitBuckets) global._rateLimitBuckets = new Map();
  return global._rateLimitBuckets;
}

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number) {
    super("Rate limit exceeded");
  }
}

function currentLimit(): number {
  const envValue = process.env.API_RATE_LIMIT_PER_MINUTE;
  const parsed = envValue ? Number(envValue) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIMIT_PER_MINUTE;
}

// In-memory sliding window keyed by caller identity (the firm ID resolved
// from the API key, not the key itself — avoids holding the secret in a
// long-lived map). Single-process only: fine for FormRight's current
// single-instance deployment, but this Map isn't shared across server
// instances — swap for a Redis-backed limiter (e.g. Upstash) before scaling
// horizontally, or the effective limit becomes "N x instance count".
//
// `limitOverride` lets callers outside the v1 API (which use the shared
// API_RATE_LIMIT_PER_MINUTE budget) apply a tighter, purpose-specific limit
// against the same sliding-window bucket store — e.g. magic-link requests
// per email, which should never need 100/minute.
export function checkRateLimit(key: string, limitOverride?: number): void {
  const limit = limitOverride ?? currentLimit();
  const buckets = getBuckets();
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (buckets.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const oldestInWindow = timestamps[0];
    const retryAfterSeconds = Math.max(Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000), 1);
    buckets.set(key, timestamps);
    throw new RateLimitError(retryAfterSeconds);
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
}

// Best-effort client IP from proxy headers, for rate-limiting keys on
// unauthenticated routes that have no API-key/firm identity to key on.
// Spoofable by a direct client (there's no trusted-proxy allowlist here), but
// this is a courtesy throttle against casual abuse, not the security boundary
// — the per-email key alongside it is what actually bounds damage.
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
