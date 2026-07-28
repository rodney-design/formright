import crypto from "crypto";

const UNIQUE_VIOLATION = "23505";

// Originally 'FR-' + 6 random decimal digits (900,000 keyspace) with no
// uniqueness check — birthday-paradox collisions started under 1,000
// registrations and would 500 the checkout INSERT on a duplicate PK. Widened
// to a 10-hex-char crypto-random suffix (~40 bits, ~1.1 trillion keyspace) and
// paired with insertRegistrationWithUniqueId's retry-on-collision below so a
// collision (now astronomically rarer) still can't surface as a user-facing error.
export function generateRegistrationId(): string {
  const suffix = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `FR-${suffix}`;
}

// Retries `insert(id)` with a freshly generated ID whenever the insert fails
// on a unique-constraint violation (Postgres code 23505), instead of letting
// a random ID collision surface as a 500 to the customer mid-checkout.
export async function insertRegistrationWithUniqueId<T>(
  insert: (registrationId: string) => Promise<T>,
  attempts = 5
): Promise<{ id: string; result: T }> {
  for (let i = 0; i < attempts; i++) {
    const id = generateRegistrationId();
    try {
      const result = await insert(id);
      return { id, result };
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== UNIQUE_VIOLATION || i === attempts - 1) throw err;
    }
  }
  throw new Error("unreachable");
}
