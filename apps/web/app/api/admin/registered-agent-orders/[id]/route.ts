import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateRegisteredAgentOrder } from "@/lib/queries/registeredAgent";
import { REGISTERED_AGENT_STATUSES, type RegisteredAgentStatus } from "@/lib/registered-agent/status";

export const runtime = "nodejs";

// Manual fulfillment update — staff place the order with Northwest's
// wholesale team by phone/email (see db/migrations/005_registered_agent.sql
// for why), then record the result here.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const update: { status?: RegisteredAgentStatus; providerConfirmationId?: string } = {};

  if (typeof body.status === "string" && body.status) {
    if (!REGISTERED_AGENT_STATUSES.includes(body.status as RegisteredAgentStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status as RegisteredAgentStatus;
  }
  if (typeof body.providerConfirmationId === "string" && body.providerConfirmationId) {
    update.providerConfirmationId = body.providerConfirmationId;
  }

  const updated = await updateRegisteredAgentOrder(params.id, update);
  if (!updated) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  return NextResponse.json({ order: updated });
}
