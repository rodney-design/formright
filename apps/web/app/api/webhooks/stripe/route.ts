import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { query } from "@/lib/db";
import { sendRegistrationConfirmationEmail } from "@/lib/email";
import { ensureStateFiling } from "@/lib/queries/stateFilings";
import { ensureRegisteredAgentOrder } from "@/lib/queries/registeredAgent";
import { upsertFirmSubscription } from "@/lib/queries/firmSubscriptions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const registrationId = paymentIntent.metadata?.registrationId;

    if (registrationId) {
      const existingPayment = await query(
        "SELECT id FROM payments WHERE stripe_payment_intent_id = $1",
        [paymentIntent.id]
      );
      if (existingPayment.rows.length === 0) {
        const regResult = await query<{
          amount_cents: number;
          state_fee_cents: number | null;
          orgname: string;
          contact_email: string;
          state: string;
          notes: string | null;
        }>(
          "SELECT amount_cents, state_fee_cents, orgname, contact_email, state, notes FROM registrations WHERE id = $1",
          [registrationId]
        );
        const registration = regResult.rows[0];

        if (registration) {
          await query("UPDATE registrations SET status = 'paid' WHERE id = $1", [registrationId]);
          await query(
            `INSERT INTO payments (registration_id, stripe_payment_intent_id, amount_cents, state_fee_cents, status)
             VALUES ($1, $2, $3, $4, 'succeeded')`,
            [registrationId, paymentIntent.id, registration.amount_cents, registration.state_fee_cents]
          );
          await ensureStateFiling(registrationId, registration.state);
          if (purchasedRegisteredAgent(registration.notes)) {
            await ensureRegisteredAgentOrder(registrationId);
          }
          // Payment is already committed at this point — a confirmation-email
          // failure must not fail the webhook response. Returning non-2xx
          // would make Stripe retry, and the idempotency check above would
          // then skip this whole block (including the email) on retry,
          // silently losing it forever instead of just this once.
          try {
            await sendRegistrationConfirmationEmail(
              registration.contact_email,
              registration.orgname,
              registrationId
            );
          } catch (err) {
            console.error(`Failed to send registration confirmation email for ${registrationId}:`, err);
          }
        }
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const registrationId = paymentIntent.metadata?.registrationId;
    if (registrationId) {
      await query("UPDATE registrations SET status = 'payment_failed' WHERE id = $1", [registrationId]);
    }
  }

  // FormRight Comply subscription (build-order doc §Phase 2 step 4) and
  // firm per-seat billing (build-order doc §Phase 4 step 4) — distinguished
  // by which metadata key is present (userId vs. firmId).
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription" && session.subscription) {
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      const firmId = session.metadata?.firmId;
      const userId = session.client_reference_id ?? session.metadata?.userId;
      if (firmId) {
        await upsertFirmSeatSubscription(firmId, subscriptionId);
      } else if (userId) {
        await upsertSubscription(userId, subscriptionId);
      }
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const firmId = subscription.metadata?.firmId;
    const userId = subscription.metadata?.userId;
    if (firmId) {
      await upsertFirmSeatSubscription(firmId, subscription.id, subscription);
    } else if (userId) {
      await upsertSubscription(userId, subscription.id, subscription);
    }
  }

  return NextResponse.json({ received: true });
}

function purchasedRegisteredAgent(notes: string | null): boolean {
  if (!notes) return false;
  try {
    const parsed = JSON.parse(notes);
    const addons = parsed?.addons;
    return Array.isArray(addons) && addons.includes("registered_agent");
  } catch {
    return false;
  }
}

async function upsertFirmSeatSubscription(firmId: string, subscriptionId: string, subscription?: Stripe.Subscription) {
  const stripe = getStripe();
  const sub = subscription ?? (await stripe.subscriptions.retrieve(subscriptionId));
  const seats = sub.items.data[0]?.quantity ?? 1;
  const renewsAt = sub.items.data[0]?.current_period_end
    ? new Date(sub.items.data[0].current_period_end * 1000)
    : null;
  await upsertFirmSubscription(firmId, subscriptionId, sub.status, seats, renewsAt);
}

async function upsertSubscription(userId: string, subscriptionId: string, subscription?: Stripe.Subscription) {
  const stripe = getStripe();
  const sub = subscription ?? (await stripe.subscriptions.retrieve(subscriptionId));
  const plan = (sub.metadata?.plan as "comply" | "agent" | undefined) ?? "comply";
  const renewsAt = sub.items.data[0]?.current_period_end
    ? new Date(sub.items.data[0].current_period_end * 1000)
    : null;

  const existing = await query<{ id: string }>(
    "SELECT id FROM subscriptions WHERE stripe_subscription_id = $1",
    [subscriptionId]
  );
  if (existing.rows.length > 0) {
    await query(
      "UPDATE subscriptions SET status = $1, renews_at = $2 WHERE stripe_subscription_id = $3",
      [sub.status, renewsAt, subscriptionId]
    );
  } else {
    await query(
      `INSERT INTO subscriptions (user_id, stripe_subscription_id, plan, status, renews_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, subscriptionId, plan, sub.status, renewsAt]
    );
  }
}
