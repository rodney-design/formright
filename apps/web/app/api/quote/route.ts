import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { entityFamily } from "@/lib/entities/entityFamily";
import { getStateFeeForEntity } from "@/lib/entities/stateFeesTable";
import { ADDONS, getPlansForEntity } from "@/lib/entities/pricing";

export const runtime = "nodejs";

const quoteSchema = z.object({
  orgtype: z.string().min(1),
  state: z.string().min(1),
  planKey: z.string().min(1),
  addonKeys: z.array(z.string()).default([]),
});

// Returns the same server-computed total /api/checkout will actually charge.
// The wizard's Step 6 previously computed its displayed total from the flat
// client-side STATE_FEES table while checkout charged from the normalized DB
// state_fees table — for seeded states those diverge (e.g. California LLC
// showed $30 but charged $70), so the customer saw a different total on the
// Stripe page than the one they'd just approved. This endpoint lets the
// wizard display the real number instead of guessing at it.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { orgtype, state, planKey, addonKeys } = parsed.data;

  const family = entityFamily(orgtype);
  const plan = getPlansForEntity(family).find((p) => p.key === planKey);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const stateFeeDetail = await getStateFeeForEntity(state, family);
  const stateFeeCents = stateFeeDetail?.feeCents ?? 0;
  // Must mirror /api/checkout's exclusion exactly, or this endpoint's whole
  // purpose (showing the real number checkout will charge) breaks: a bundled
  // registered_agent addon would be quoted here but not actually charged
  // there, so the customer would see a higher total than they're billed.
  const selectedAddons = ADDONS.filter(
    (a) => addonKeys.includes(a.key) && !a.recurring && !(a.key === "registered_agent" && plan.includesRegisteredAgent)
  );
  const addonsCents = selectedAddons.reduce((sum, a) => sum + a.priceCents, 0);
  const totalCents = plan.priceCents === null ? null : plan.priceCents + stateFeeCents + addonsCents;

  return NextResponse.json({
    planPriceCents: plan.priceCents,
    stateFeeCents,
    stateFeeNotes: stateFeeDetail?.notes ?? null,
    addonsCents,
    totalCents,
  });
}
