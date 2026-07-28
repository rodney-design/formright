import { NextRequest, NextResponse } from "next/server";
import { requireContractor } from "@/lib/auth";
import { getContractorByUserId } from "@/lib/queries/contractors";
import {
  getRegisteredAgentOrderById,
  updateRegisteredAgentOrder,
  MissingProviderConfirmationError,
} from "@/lib/queries/registeredAgent";
import { REGISTERED_AGENT_STATUSES, type RegisteredAgentStatus } from "@/lib/registered-agent/status";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireContractor();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contractor = await getContractorByUserId(user.id);
  const order = await getRegisteredAgentOrderById(params.id);
  if (!contractor || !order || order.assigned_contractor_id !== contractor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
  if (!updated) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  return NextResponse.json({ order: updated });
}
