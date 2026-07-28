// Regression coverage for a real bug: generateRegistrationId()'s 6-digit ID
// (900,000 possible values, plain Math.random()) had no DB-side uniqueness
// check before insert into registrations.id (a TEXT PRIMARY KEY) — a
// collision threw an unhandled unique-violation. withRegistrationIdRetry
// wraps the insert with retry-on-collision instead.
import { describe, it, expect, vi } from "vitest";
import { withRegistrationIdRetry } from "@/lib/registrationId";

function uniqueViolation(): Error & { code: string } {
  const err = new Error('duplicate key value violates unique constraint "registrations_pkey"');
  return Object.assign(err, { code: "23505" });
}

describe("withRegistrationIdRetry", () => {
  it("returns immediately on the first successful attempt", async () => {
    const insert = vi.fn().mockResolvedValue("ok");
    const result = await withRegistrationIdRetry(insert);
    expect(result).toBe("ok");
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("retries with a fresh id on a unique-violation and succeeds", async () => {
    const seenIds: string[] = [];
    const insert = vi.fn().mockImplementation(async (id: string) => {
      seenIds.push(id);
      if (seenIds.length < 3) throw uniqueViolation();
      return id;
    });

    const result = await withRegistrationIdRetry(insert);
    expect(insert).toHaveBeenCalledTimes(3);
    expect(result).toBe(seenIds[2]);
    // Each retry must actually use a different id, or "retry" is a no-op.
    expect(new Set(seenIds).size).toBe(3);
  });

  it("does not retry a non-collision error — propagates immediately", async () => {
    const otherError = new Error("connection terminated unexpectedly");
    const insert = vi.fn().mockRejectedValue(otherError);

    await expect(withRegistrationIdRetry(insert)).rejects.toBe(otherError);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("gives up and throws after exhausting retries on repeated collisions", async () => {
    const insert = vi.fn().mockRejectedValue(uniqueViolation());

    await expect(withRegistrationIdRetry(insert)).rejects.toMatchObject({ code: "23505" });
    // Bounded retries, not an infinite loop.
    expect(insert.mock.calls.length).toBeGreaterThan(1);
    expect(insert.mock.calls.length).toBeLessThanOrEqual(10);
  });
});
