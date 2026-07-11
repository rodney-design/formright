import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireFirmAdmin, countActiveFirmMembers } from "@/lib/queries/firms";

export const runtime = "nodejs";

// Per-seat billing for FormRight Pro firms (build-order doc §Phase 4 step 4).
// Unlike the initial Pro-tier signup (brief §4.3: "Contact Sales," not
// self-serve — firms are onboarded by staff via /admin/firms), *managing*
// the resulting seat subscription is self-service from the firm dashboard
// once the firm exists.
//
// FIRM_SEAT_PRICE_CENTS is intentionally not hardcoded — no verified
// per-seat price exists in the build-order doc or pricing.ts (those are
// per-formation Pro-tier prices, a different monetization axis). Set it via
// env once the business has a real number; until then this endpoint errors
// instead of charging an invented figure.
export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireFirmAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const seatPriceCents = process.env.FIRM_SEAT_PRICE_CENTS ? Number(process.env.FIRM_SEAT_PRICE_CENTS) : null;
  if (!seatPriceCents) {
    return NextResponse.json(
      { error: "Per-seat pricing isn't configured yet (FIRM_SEAT_PRICE_CENTS) — contact FormRight sales." },
      { status: 500 }
    );
  }

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
