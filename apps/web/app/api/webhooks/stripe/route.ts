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

  return NextResponse.json({ received: true });
}
