import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateContractorStatus } from "@/lib/queries/contractors";
import { CONTRACTOR_STATUSES, type ContractorStatus } from "@/lib/contractors/types";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !CONTRACTOR_STATUSES.includes(body.status as ContractorStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await updateContractorStatus(params.id, body.status as ContractorStatus);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ contractor: updated });
}
