import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateStateFiling, MissingStateConfirmationError } from "@/lib/queries/stateFilings";
import { FILING_STATUSES, type FilingStatus } from "@/lib/state-filing/status";
import { uploadDocument } from "@/lib/storage";
import { assignContractorToStateFiling } from "@/lib/queries/contractors";

export const runtime = "nodejs";

// Manual filing status update (build-order doc §Phase 3 step 3: "filing
// status webhook/polling — update registration status in real time"). Since
// none of the 5 priority states expose a real filing-status webhook or
// polling API today, this is staff updating status by hand after checking
// the state's own portal, plus attaching the stamped certificate once the
// state issues one. See lib/state-filing/worksheet.ts for the fuller context.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const filingStatusRaw = formData.get("filingStatus");
  const stateConfirmationId = formData.get("stateConfirmationId");
  const stampedDoc = formData.get("stampedDoc");
  const assignedContractorId = formData.get("assignedContractorId");

  const update: { filingStatus?: FilingStatus; stateConfirmationId?: string; stampedDocS3Key?: string } = {};

  if (typeof filingStatusRaw === "string" && filingStatusRaw) {
    if (!FILING_STATUSES.includes(filingStatusRaw as FilingStatus)) {
      return NextResponse.json({ error: "Invalid filing status" }, { status: 400 });
    }
    update.filingStatus = filingStatusRaw as FilingStatus;
  }
  if (typeof stateConfirmationId === "string" && stateConfirmationId) {
    update.stateConfirmationId = stateConfirmationId;
  }
  if (stampedDoc instanceof File && stampedDoc.size > 0) {
    const buffer = Buffer.from(await stampedDoc.arrayBuffer());
    // BUG (fixed): same unsanitized-filename issue as the contractor-facing
    // equivalent route — see that file's comment for the full explanation.
    const safeName = stampedDoc.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = `state-filings/${params.id}/stamped_${Date.now()}_${safeName}`;
    await uploadDocument(storageKey, buffer, stampedDoc.type || "application/pdf");
    update.stampedDocS3Key = storageKey;
  }

  let updated;
  try {
    updated = await updateStateFiling(params.id, update);
  } catch (err) {
    if (err instanceof MissingStateConfirmationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (typeof assignedContractorId === "string") {
    await assignContractorToStateFiling(params.id, assignedContractorId || null);
  }

  if (!updated && typeof assignedContractorId !== "string") {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  return NextResponse.json({ stateFiling: updated });
}
