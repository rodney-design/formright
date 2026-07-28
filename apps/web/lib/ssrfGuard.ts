import "server-only";
import dns from "dns/promises";
import net from "net";

// Blocks the classic SSRF targets for any server-side "fetch a URL a
// customer gave us" feature (currently: firm branding logoUrl in
// lib/doc-engine/branding.ts). A firm admin controls this URL, so it must
// not be able to reach internal services, cloud metadata endpoints
// (169.254.169.254), or other link-local/private-network addresses.

export class SsrfBlockedError extends Error {}

const MAX_FETCH_BYTES = 5 * 1024 * 1024; // 5 MB — plenty for a logo image
const FETCH_TIMEOUT_MS = 5_000;

function ipv4ToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function inIpv4Range(ip: string, base: string, prefixLength: number): boolean {
  const mask = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  return (ipv4ToLong(ip) & mask) === (ipv4ToLong(base) & mask);
}

// Private, loopback, link-local (includes the 169.254.169.254 cloud metadata
// address), CGNAT, and other non-public IPv4 ranges.
const BLOCKED_IPV4_RANGES: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function isBlockedIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) {
    return BLOCKED_IPV4_RANGES.some(([base, prefix]) => inIpv4Range(ip, base, prefix));
  }
  if (family === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true; // fe80::/10 link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 unique local
    // IPv4-mapped IPv6 (::ffff:a.b.c.d) — check the embedded v4 address too.
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedIp(mapped[1]);
    return false;
  }
  return true; // Not a recognizable IP at all — fail closed.
}

// Resolves `hostname` and throws SsrfBlockedError if it's a raw disallowed IP
// literal, or if DNS resolves it to any disallowed address. Doesn't fully
// close the DNS-rebinding gap (the second lookup `fetch()` performs
// internally could in principle differ from this one), but this matches the
// "resolve DNS and reject private/link-local/metadata ranges" bar for a
// firm-admin-supplied logo URL, which is a low-volume, authenticated input.
async function assertPublicHostname(hostname: string): Promise<void> {
  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) throw new SsrfBlockedError(`Blocked address: ${hostname}`);
    return;
  }
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0) throw new SsrfBlockedError(`Could not resolve host: ${hostname}`);
  for (const { address } of records) {
    if (isBlockedIp(address)) throw new SsrfBlockedError(`Host ${hostname} resolves to a blocked address`);
  }
}

// Fetches `url` with SSRF guards (https-only, public-address-only, timeout,
// response-size cap) and returns the raw bytes plus content-type, or null if
// the guard rejected it or the fetch/read failed — callers should treat null
// the same as "no logo", never surface guard details to the requester.
export async function fetchExternalImageSafely(
  url: string
): Promise<{ bytes: Buffer; contentType: string | null } | null> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;

  try {
    await assertPublicHostname(parsed.hostname);
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(parsed, { signal: controller.signal, redirect: "error" });
    if (!res.ok || !res.body) return null;

    const contentLength = res.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_FETCH_BYTES) return null;

    const chunks: Uint8Array[] = [];
    let total = 0;
    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      total += chunk.length;
      if (total > MAX_FETCH_BYTES) return null;
      chunks.push(chunk);
    }
    return { bytes: Buffer.concat(chunks), contentType: res.headers.get("content-type") };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
