import "server-only";
import * as Sentry from "@sentry/nextjs";
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
  return _stripe;
}

// Every subscription this app creates (FormRight Comply, firm per-seat
// billing) is checked out with exactly one price_data line item — there's no
// stable Stripe Price/Product ID to look the "right" item up by, since
// price_data mints an ad-hoc price per session. Reading items.data[0]
// unconditionally would silently apply seat-quantity updates or read renewal
// dates off the wrong item if a second item ever showed up on one of these
// subscriptions (e.g. from a manual Stripe Dashboard edit); this at least
// makes that situation loud instead of silently wrong.
export function getSingleSubscriptionItem(sub: Stripe.Subscription): Stripe.SubscriptionItem | null {
  if (sub.items.data.length !== 1) {
    Sentry.captureException(
      new Error(`Stripe subscription ${sub.id} has ${sub.items.data.length} items, expected exactly 1`)
    );
    return null;
  }
  return sub.items.data[0];
}
