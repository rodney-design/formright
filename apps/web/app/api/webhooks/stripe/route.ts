import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { query } from "@/lib/db";
import { sendRegistrationConfirmationEmail } from "@/lib/email";

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
        }>(
          "SELECT amount_cents, state_fee_cents, orgname, contact_email FROM registrations WHERE id = $1",
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
          await sendRegistrationConfirmationEmail(
            registration.contact_email,
            registration.orgname,
            registrationId
          );
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

  // FormRight Comply subscription (build-order doc §Phase 2 step 4).
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription" && session.subscription) {
      const userId = session.client_reference_id ?? session.metadata?.userId;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      if (userId) {
        await upsertSubscription(userId, subscriptionId);
      }
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;
    if (userId) {
      await upsertSubscription(userId, subscription.id, subscription);
    }
  }

  return NextResponse.json({ received: true });
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
