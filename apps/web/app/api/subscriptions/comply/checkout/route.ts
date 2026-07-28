import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { getRegistrationById } from "@/lib/queries/registrations";
import { ADDONS } from "@/lib/entities/pricing";
import { checkRateLimit, RateLimitError } from "@/lib/rateLimit";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export const runtime = "nodejs";

const COMPLY = ADDONS.find((a) => a.key === "comply")!;

// FormRight Comply subscription (build-order doc §Phase 2 step 4) — real
// Stripe recurring billing, separate from the one-time formation checkout
// since Stripe Checkout can't mix payment and subscription line items in a
// single session. Webhook (checkout.session.completed / customer.subscription.*)
// writes the resulting subscription into the `subscriptions` table.
//
// Two entry points share this endpoint: the logged-in dashboard billing page
// (session cookie, no body needed) and the post-formation upsell on
// /onboard/success, which runs before the founder has ever logged in (no
// session exists yet — see /api/checkout's comment on why checkout doesn't
// create one). The success-page flow instead passes registrationId, which is
// already the public identifier shown in that page's URL and confirmation
// email — same trust boundary /api/v1/status already relies on.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  let userId: string;
  let email: string;

  if (user) {
    userId = user.id;
    email = user.email;
  } else {
    // BUG (fixed): registrationId is a 6-digit, plain-Math.random() public
    // identifier (see lib/registrationId.ts) — it's the *only* proof of
    // ownership on this unauthenticated path, with nothing here rate-
    // limiting lookups. That made brute-force enumeration of valid
    // registrationIds practical, letting an attacker create (and pay for) a
    // Comply subscription attributed to a victim's account. Rate limiting
    // by IP doesn't eliminate enumeration risk entirely (a longer opaque
    // token would be the fuller fix, tracked separately), but it makes
    // exhausting the 900,000-value space from a single IP impractically
    // slow instead of instant.
    try {
      checkRateLimit(`comply-checkout-lookup:${clientIp(req)}`);
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
    const registrationId = typeof body?.registrationId === "string" ? body.registrationId : null;
    if (!registrationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reg = await getRegistrationById(registrationId);
    if (!reg || !reg.contact_email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = reg.user_id;
    email = reg.contact_email;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: COMPLY.name, description: COMPLY.description },
          unit_amount: COMPLY.priceCents,
          recurring: { interval: "year" },
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    client_reference_id: userId,
    success_url: `${appUrl}/dashboard/billing?comply=success`,
    cancel_url: `${appUrl}/dashboard/billing?comply=canceled`,
    metadata: { userId, plan: "comply" },
    subscription_data: { metadata: { userId, plan: "comply" } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
