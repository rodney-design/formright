import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { markPayoutPaid } from "@/lib/queries/contractors";

export const runtime = "nodejs";

// Manual mark-paid — no payment-processor integration (e.g. Stripe Connect)
// yet, this just records that a payout was made outside the app.
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await markPayoutPaid(params.id);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ payout: updated });
}
