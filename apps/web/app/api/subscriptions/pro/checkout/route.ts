import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireFirmAdmin, countActiveFirmMembers } from "@/lib/queries/firms";
import { getFirmSubscription } from "@/lib/queries/firmSubscriptions";
import { FIRM_SEAT_PRICE_CENTS } from "@/lib/entities/pricing";

export const runtime = "nodejs";

// Per-seat billing for FormRight Pro firms (build-order doc §Phase 4 step 4).
// Unlike the initial Pro-tier signup (brief §4.3: "Contact Sales," not
// self-serve — firms are onboarded by staff via /admin/firms), *managing*
// the resulting seat subscription is self-service from the firm dashboard
// once the firm exists.
export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireFirmAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // BUG (fixed): nothing checked for an existing active subscription before
  // creating a brand-new Stripe Checkout session — a double-click, browser
  // back-button resubmit, or client retry after a slow/timed-out response
  // could create two concurrent paid seat subscriptions for the same firm,
  // an actual double charge with no malicious action required.
  const existingSubscription = await getFirmSubscription(admin.membership.firm.id);
  if (existingSubscription && existingSubscription.status !== "canceled") {
    return NextResponse.json(
      { error: "This firm already has an active Pro subscription.", alreadySubscribed: true },
      { status: 409 }
    );
  }

  const seatPriceCents = FIRM_SEAT_PRICE_CENTS;
  const seats = await countActiveFirmMembers(admin.membership.firm.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `FormRight Pro — ${admin.membership.firm.name} (per seat)` },
          unit_amount: seatPriceCents,
          recurring: { interval: "month" },
        },
        quantity: Math.max(seats, 1),
      },
    ],
    customer_email: admin.user.email,
    success_url: `${appUrl}/firm/billing?subscribed=1`,
    cancel_url: `${appUrl}/firm/billing?canceled=1`,
    metadata: { firmId: admin.membership.firm.id, kind: "firm_seats" },
    subscription_data: { metadata: { firmId: admin.membership.firm.id, kind: "firm_seats" } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
