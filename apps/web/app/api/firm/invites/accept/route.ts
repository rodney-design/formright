import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { acceptFirmInvite } from "@/lib/queries/firms";
import { syncFirmSeatQuantity } from "@/lib/queries/firmSubscriptions";

export const runtime = "nodejs";

const schema = z.object({ firmId: z.string().min(1) });

// Explicit "Join {firm}?" confirmation (see lib/queries/firms.ts for why this
// replaced auto-accept-on-login). Seats are only synced — and the firm's
// Stripe bill only increased — once the invited person actually confirms.
export async function POST(req: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const accepted = await acceptFirmInvite(user.id, parsed.data.firmId);
  if (!accepted) return NextResponse.json({ error: "No pending invite found" }, { status: 404 });

  await syncFirmSeatQuantity(parsed.data.firmId);
  return NextResponse.json({ ok: true });
}
