import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateRegisteredAgentOrder, MissingProviderConfirmationError } from "@/lib/queries/registeredAgent";
import { REGISTERED_AGENT_STATUSES, type RegisteredAgentStatus } from "@/lib/registered-agent/status";
import { assignContractorToRegisteredAgentOrder } from "@/lib/queries/contractors";

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

  let updated;
  try {
    updated = await updateRegisteredAgentOrder(params.id, update);
  } catch (err) {
    if (err instanceof MissingProviderConfirmationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (typeof body.assignedContractorId === "string") {
    await assignContractorToRegisteredAgentOrder(params.id, body.assignedContractorId || null);
  }

  if (!updated && typeof body.assignedContractorId !== "string") {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  return NextResponse.json({ order: updated });
}
