import "server-only";
import { query } from "@/lib/db";
import { getStripe, getSingleSubscriptionItem } from "@/lib/stripe";
import { countActiveFirmMembers } from "@/lib/queries/firms";

export interface FirmSubscription {
  id: string;
  firm_id: string;
  stripe_subscription_id: string;
  status: string;
  seats: number;
  renews_at: string | null;
  created_at: string;
}

export async function getFirmSubscription(firmId: string): Promise<FirmSubscription | null> {
  const result = await query<FirmSubscription>(
    "SELECT * FROM firm_subscriptions WHERE firm_id = $1 ORDER BY created_at DESC LIMIT 1",
    [firmId]
  );
  return result.rows[0] ?? null;
}

export async function upsertFirmSubscription(
  firmId: string,
  stripeSubscriptionId: string,
  status: string,
  seats: number,
  renewsAt: Date | null
): Promise<void> {
  const existing = await query<{ id: string }>(
    "SELECT id FROM firm_subscriptions WHERE stripe_subscription_id = $1",
    [stripeSubscriptionId]
  );
  if (existing.rows.length > 0) {
    await query(
      "UPDATE firm_subscriptions SET status = $1, seats = $2, renews_at = $3 WHERE stripe_subscription_id = $4",
      [status, seats, renewsAt, stripeSubscriptionId]
    );
  } else {
    await query(
      `INSERT INTO firm_subscriptions (firm_id, stripe_subscription_id, status, seats, renews_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [firmId, stripeSubscriptionId, status, seats, renewsAt]
    );
  }
}

// Per-seat billing (build-order doc §Phase 4 step 4): keeps the Stripe
// subscription's item quantity in sync with active firm_members whenever
// membership changes (invite accepted, member removed). No-ops if the firm
// doesn't have an active seat subscription yet.
export async function syncFirmSeatQuantity(firmId: string): Promise<void> {
  const subscription = await getFirmSubscription(firmId);
  if (!subscription || subscription.status === "canceled") return;

  const seats = await countActiveFirmMembers(firmId);
  if (seats === subscription.seats) return;

  const stripe = getStripe();
  const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
  const item = getSingleSubscriptionItem(stripeSub);
  if (!item) return;

  await stripe.subscriptionItems.update(item.id, { quantity: seats });
  await query("UPDATE firm_subscriptions SET seats = $1 WHERE stripe_subscription_id = $2", [
    seats,
    subscription.stripe_subscription_id,
  ]);
}
