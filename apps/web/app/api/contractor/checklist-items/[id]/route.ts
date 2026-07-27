import { NextRequest, NextResponse } from "next/server";
import { requireContractor } from "@/lib/auth";
import { getContractorByUserId, getChecklistItemWithOwnership, setChecklistItemCompleted } from "@/lib/queries/contractors";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireContractor();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contractor = await getContractorByUserId(user.id);
  const owned = await getChecklistItemWithOwnership(params.id);
  if (!contractor || !owned || owned.assignedContractorId !== contractor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.completed !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updated = await setChecklistItemCompleted(params.id, contractor.id, body.completed);
  return NextResponse.json({ item: updated });
}
