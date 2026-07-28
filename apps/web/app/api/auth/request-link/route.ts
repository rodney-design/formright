import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createMagicLinkToken } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";
import { checkRateLimit, getClientIp, RateLimitError } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Unlimited sign-in emails per address/IP would let someone bomb an inbox
// (or a stranger's inbox) and burn SendGrid sender reputation for free —
// tighter than the v1 API's shared 100/min budget since this is a single
// unauthenticated action, not a firm's whole API usage.
const PER_EMAIL_LIMIT_PER_MINUTE = 5;
const PER_IP_LIMIT_PER_MINUTE = 20;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    checkRateLimit(`request-link:email:${email}`, PER_EMAIL_LIMIT_PER_MINUTE);
    checkRateLimit(`request-link:ip:${getClientIp(req)}`, PER_IP_LIMIT_PER_MINUTE);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Too many sign-in requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(err.retryAfterSeconds) } }
      );
    }
    throw err;
  }

  const token = await createMagicLinkToken(email, typeof body?.name === "string" ? body.name : undefined);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const verifyUrl = `${appUrl}/api/auth/verify?token=${token}`;

  try {
    await sendMagicLinkEmail(email, verifyUrl);
  } catch (err) {
    console.error(`Failed to send magic-link email to ${email}:`, err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Could not send sign-in email. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
