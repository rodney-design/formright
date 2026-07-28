import crypto from "crypto";

// Plain `===` on a secret comparison leaks timing information proportional
// to how many leading bytes match, in principle letting an attacker recover
// the secret byte-by-byte. crypto.timingSafeEqual requires equal-length
// buffers (it throws otherwise), so the length check has to happen first —
// that leaks only the secret's length, not its content.
export function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
