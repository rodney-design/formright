import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createPayout, getContractorById } from "@/lib/queries/contractors";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const amountCents = Number(body?.amountCents);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "amountCents must be a positive number" }, { status: 400 });
  }

  // BUG (fixed): createPayout() inserts straight into contractor_payouts,
  // whose contractor_id column is NOT NULL REFERENCES contractors(id) — a
  // stale/mistyped contractor ID used to hit that FK violation as an
  // unhandled Postgres error (an opaque 500), instead of a clean 404.
  const contractor = await getContractorById(params.id);
  if (!contractor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stateFilingId = typeof body?.stateFilingId === "string" && body.stateFilingId ? body.stateFilingId : null;
  const payout = await createPayout(params.id, Math.round(amountCents), stateFilingId);

  return NextResponse.json({ payout });
}
