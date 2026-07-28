// Ported format from completeOnboard() (line 26308): 'FR-' + 6 random digits.
export function generateRegistrationId(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `FR-${n}`;
}

const MAX_ID_COLLISION_RETRIES = 5;

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "23505";
}

// BUG (fixed): generateRegistrationId()'s 6-digit space (900,000 possible
// values, plain Math.random()) had no DB-side uniqueness check before
// insert into registrations.id, a TEXT PRIMARY KEY, at any call site.
// Birthday-paradox math puts ~50% collision odds after roughly 1,100 total
// registrations ever created — well within this app's expected lifetime
// volume — and a collision threw an unhandled unique-violation with no
// retry. This keeps the short, public, confirmation-style ID format (shown
// in URLs and emails, not meant to be long/opaque) but retries with a
// fresh ID on a genuine collision instead of crashing the request. Callers
// pass a callback that performs just the INSERT (and returns the id on
// success) — retries are scoped tightly to that one statement, not to
// whatever else the caller does afterward with the id.
export async function withRegistrationIdRetry<T>(
  insert: (registrationId: string) => Promise<T>
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ID_COLLISION_RETRIES; attempt++) {
    const registrationId = generateRegistrationId();
    try {
      return await insert(registrationId);
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      lastErr = err;
    }
  }
  throw lastErr;
}
