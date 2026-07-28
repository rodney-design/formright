import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { query } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { entityFamily } from "@/lib/entities/entityFamily";
import { getStateFeeForEntity } from "@/lib/entities/stateFeesTable";
import { ADDONS, getPlansForEntity } from "@/lib/entities/pricing";
import { generateRegistrationId } from "@/lib/registrationId";
import { seedComplianceEventsForRegistration } from "@/lib/entities/complianceRulesTable";

export const runtime = "nodejs";

const boardMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  email: z.string().optional().default(""),
});

const checkoutSchema = z.object({
  orgname: z.string().min(1),
  orgtype: z.string().min(1),
  state: z.string().min(1),
  fiscal: z.string().optional().default(""),
  address: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().optional().default(""),
  ein: z.string().optional().default(""),
  mission: z.string().optional().default(""),
  programs: z.string().optional().default(""),
  geoArea: z.string().optional().default(""),
  beneficiaries: z.string().optional().default(""),
  revenue: z.string().optional().default(""),
  caNonprofitSubtype: z.string().optional().default(""),
  board: z.array(boardMemberSchema).default([]),
  registeredAgentName: z.string().optional().default(""),
  registeredAgentAddress: z.string().optional().default(""),
  governance: z.record(z.string(), z.unknown()).optional().default({}),
  irs: z.record(z.string(), z.unknown()).optional().default({}),
  fname: z.string().min(1),
  lname: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  planKey: z.string().min(1),
  addonKeys: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const family = entityFamily(data.orgtype);
  const plans = getPlansForEntity(family);
  const plan = plans.find((p) => p.key === data.planKey);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }
  if (plan.priceCents === null) {
    return NextResponse.json(
      { error: "This plan requires a custom quote — please contact sales instead of checking out." },
      { status: 400 }
    );
  }

  const stateFeeDetail = await getStateFeeForEntity(data.state, family);
  const stateFeeCents = stateFeeDetail?.feeCents ?? 0;
  // Recurring addons (e.g. Comply) aren't sellable as a one-time Checkout
  // line item — Stripe Checkout can't mix one-time and recurring items in
  // "payment" mode. Those are subscribed to separately after formation; see
  // POST /api/subscriptions/comply/checkout.
  const selectedAddons = ADDONS.filter((a) => data.addonKeys.includes(a.key) && !a.recurring);
  const addonsCents = selectedAddons.reduce((sum, a) => sum + a.priceCents, 0);
  const totalCents = plan.priceCents + stateFeeCents + addonsCents;

  // Find-or-create the user by email. We deliberately do NOT create a session
  // here — anyone can type an email into a checkout form, so proving
  // ownership still requires the magic-link flow (see lib/auth.ts).
  const existingUser = await query<{ id: string }>("SELECT id FROM users WHERE email = $1", [data.email]);
  let userId: string;
  if (existingUser.rows.length > 0) {
    userId = existingUser.rows[0].id;
  } else {
    const inserted = await query<{ id: string }>(
      "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id",
      [data.email, `${data.fname} ${data.lname}`.trim()]
    );
    userId = inserted.rows[0].id;
  }

  const registrationId = generateRegistrationId();
  const notes = JSON.stringify({
    orgtypeRaw: data.orgtype,
    nonprofitSubtype: data.caNonprofitSubtype,
    programs: data.programs,
    geoArea: data.geoArea,
    beneficiaries: data.beneficiaries,
    revenue: data.revenue,
    registeredAgentName: data.registeredAgentName,
    registeredAgentAddress: data.registeredAgentAddress,
    governance: data.governance,
    irsScreening: data.irs,
    plan: plan.key,
    addons: selectedAddons.map((a) => a.key),
    phone: data.phone,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const stripe = getStripe();

  // BUG (fixed): the registration INSERT and compliance-event seeding used
  // to run *before* this try block, which only wrapped the Stripe call.
  // That reintroduced the exact "orphaned pending registration" bug PR #1
  // already fixed one step later in this same route — if seeding compliance
  // events threw for any reason, the registration row committed above was
  // permanently stuck in 'pending' status with no Stripe session ever
  // created and no cleanup path (the catch block's rollback only ran for
  // Stripe failures). Moving the insert + seeding inside this try means any
  // failure anywhere in the sequence — including a registration-ID
  // collision on the insert itself — gets the same rollback and clean error
  // response as a Stripe failure does.
  try {
    await query(
      `INSERT INTO registrations
         (id, user_id, orgname, entity_type, state, plan, status, amount_cents, state_fee_cents,
          board, mission, contact_name, contact_email, address, ein, fiscal_year, notes)
       VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        registrationId,
        userId,
        data.orgname,
        family,
        data.state,
        plan.name,
        totalCents,
        stateFeeCents,
        JSON.stringify(data.board),
        data.mission,
        `${data.fname} ${data.lname}`.trim(),
        data.email,
        JSON.stringify({ address: data.address, city: data.city, zip: data.zip }),
        data.ein,
        data.fiscal,
        notes,
      ]
    );

    const complianceEvents = await seedComplianceEventsForRegistration(family, data.state, new Date(), data.fiscal);
    for (const event of complianceEvents) {
      await query(
        `INSERT INTO compliance_events (registration_id, event_type, due_date)
         VALUES ($1, $2, $3)`,
        [registrationId, event.eventType, event.dueDate]
      );
    }

    const lineItems: Array<{ price_data: { currency: string; product_data: { name: string; description?: string }; unit_amount: number }; quantity: number }> = [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `FormRight ${plan.name} Plan — ${data.orgname}` },
          unit_amount: plan.priceCents,
        },
        quantity: 1,
      },
    ];
    if (stateFeeCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${data.state} state filing fee`,
            // Surfaces things this fee does NOT cover (e.g. CA's separate $800/yr
            // franchise tax, NY's LLC publication requirement) at checkout time,
            // not buried in a support ticket later.
            ...(stateFeeDetail?.notes ? { description: stateFeeDetail.notes } : {}),
          },
          unit_amount: stateFeeCents,
        },
        quantity: 1,
      });
    }
    for (const addon of selectedAddons) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: addon.name, description: addon.description },
          unit_amount: addon.priceCents,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: data.email,
      success_url: `${appUrl}/onboard/success?registration=${registrationId}`,
      cancel_url: `${appUrl}/onboard?step=6&canceled=1`,
      metadata: { registrationId },
      payment_intent_data: { metadata: { registrationId } },
    });

    if (!session.url) {
      throw new Error("Stripe checkout session has no url");
    }

    return NextResponse.json({ url: session.url, registrationId, totalCents });
  } catch (err) {
    // No Stripe session got created for this registration — whether the
    // failure was the registration insert itself, compliance-event seeding,
    // or the Stripe call — so roll everything for this registrationId back
    // rather than leaving a permanent orphaned "pending" row with no
    // payment attached and no retry path.
    console.error(`Checkout failed for registration ${registrationId}:`, err);
    Sentry.captureException(err);
    try {
      await query("DELETE FROM compliance_events WHERE registration_id = $1", [registrationId]);
      await query("DELETE FROM registrations WHERE id = $1", [registrationId]);
    } catch (cleanupErr) {
      // The client still gets a clean error either way — but if cleanup
      // itself failed, that orphaned registration needs manual attention,
      // so it's reported distinctly from the original Stripe failure.
      console.error(`Failed to roll back orphaned registration ${registrationId}:`, cleanupErr);
      Sentry.captureException(cleanupErr);
    }
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 502 });
  }
}
