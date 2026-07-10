import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { ADDONS } from "@/lib/entities/pricing";

export const runtime = "nodejs";

const COMPLY = ADDONS.find((a) => a.key === "comply")!;

// FormRight Comply subscription (build-order doc §Phase 2 step 4) — real
// Stripe recurring billing, separate from the one-time formation checkout
// since Stripe Checkout can't mix payment and subscription line items in a
// single session. Webhook (checkout.session.completed / customer.subscription.*)
// writes the resulting subscription into the `subscriptions` table.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    customer_email: user.email,
    client_reference_id: user.id,
    success_url: `${appUrl}/dashboard/billing?comply=success`,
    cancel_url: `${appUrl}/dashboard/billing?comply=canceled`,
    metadata: { userId: user.id, plan: "comply" },
    subscription_data: { metadata: { userId: user.id, plan: "comply" } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
