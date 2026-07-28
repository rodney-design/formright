import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createMagicLinkToken } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";
import { checkRateLimit, RateLimitError } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// This route is public/unauthenticated by design (that's the whole point of
// magic-link sign-in), which previously meant it was the one DB-writing,
// email-sending endpoint in the app with no rate limiting at all — unlike
// the v1 API key routes, which all go through lib/apiAuth.ts's
// checkRateLimit. An attacker could flood arbitrary email addresses,
// driving SendGrid volume/cost and creating unbounded `users` rows. Keyed
// by client IP (not email) since email is attacker-controlled and doesn't
// prevent one IP from flooding many different addresses.
function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    checkRateLimit(`request-link:${clientIp(req)}`);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(err.retryAfterSeconds) } }
      );
    }
    throw err;
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  // BUG (fixed): createMagicLinkToken used to run outside this try/catch —
  // only the email send was guarded. createMagicLinkToken does a real DB
  // write (SELECT then INSERT/UPDATE against `users`), and any failure
  // there (a dropped connection, a transient network blip, anything) was an
  // uncaught exception that Next.js turned into a raw 500 with no
  // Sentry report and no clean error body, unlike every other failure mode
  // in this route. Wrapping the whole thing means a DB hiccup here gets the
  // same graceful handling as an email-send failure.
  try {
    const token = await createMagicLinkToken(email, typeof body?.name === "string" ? body.name : undefined);
    const verifyUrl = `${appUrl}/api/auth/verify?token=${token}`;
    await sendMagicLinkEmail(email, verifyUrl);
  } catch (err) {
    console.error(`Failed to send magic-link email to ${email}:`, err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Could not send sign-in email. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
