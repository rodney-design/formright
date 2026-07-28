import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  updateRegisteredAgentOrder,
  getRegisteredAgentOrderById,
  MissingProviderConfirmationError,
} from "@/lib/queries/registeredAgent";
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

  const hasFieldUpdate = Object.keys(update).length > 0;
  const hasAssignmentUpdate = typeof body.assignedContractorId === "string";

  if (!hasFieldUpdate && !hasAssignmentUpdate) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
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

  // BUG (fixed): updateRegisteredAgentOrder() returns null both when
  // `update` was empty and when params.id doesn't match any row — with
  // fields actually provided, a null result means the ID is bad, not that
  // there was nothing to do.
  if (hasFieldUpdate && !updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (hasAssignmentUpdate) {
    await assignContractorToRegisteredAgentOrder(params.id, body.assignedContractorId || null);
  }

  // BUG (fixed): an assignment-only request (no status/providerConfirmationId
  // fields) left `updated` null and returned { order: null } even on
  // success, since the assignment update never populated it. Re-fetch the
  // current row so the response always reflects what's actually stored —
  // and 404 if the assignment silently matched zero rows because the ID
  // doesn't exist (assignContractorToRegisteredAgentOrder's UPDATE doesn't
  // error on a no-op).
  if (!updated) {
    updated = await getRegisteredAgentOrderById(params.id);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ order: updated });
}
