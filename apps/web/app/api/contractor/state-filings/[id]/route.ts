import { NextRequest, NextResponse } from "next/server";
import { requireContractor } from "@/lib/auth";
import { getContractorByUserId } from "@/lib/queries/contractors";
import { getStateFilingById, updateStateFiling } from "@/lib/queries/stateFilings";
import { FILING_STATUSES, type FilingStatus } from "@/lib/state-filing/status";
import { uploadDocument } from "@/lib/storage";
import { sanitizeUploadFilename, validateUploadedFile } from "@/lib/uploads";

export const runtime = "nodejs";

// Contractor-facing equivalent of api/admin/state-filings/[id]/route.ts —
// same update shape, but restricted to jobs actually assigned to the
// requesting contractor (an admin can edit any filing; a contractor can
// only touch their own assigned work).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireContractor();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contractor = await getContractorByUserId(user.id);
  const filing = await getStateFilingById(params.id);
  if (!contractor || !filing || filing.assigned_contractor_id !== contractor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const filingStatusRaw = formData.get("filingStatus");
  const stateConfirmationId = formData.get("stateConfirmationId");
  const stampedDoc = formData.get("stampedDoc");

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
    const validationError = validateUploadedFile(stampedDoc);
    if (validationError) return NextResponse.json(validationError, { status: 400 });
    const buffer = Buffer.from(await stampedDoc.arrayBuffer());
    const storageKey = `state-filings/${params.id}/stamped_${Date.now()}_${sanitizeUploadFilename(stampedDoc.name)}`;
    await uploadDocument(storageKey, buffer, stampedDoc.type || "application/pdf");
    update.stampedDocS3Key = storageKey;
  }

  const updated = await updateStateFiling(params.id, update);
  if (!updated) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  return NextResponse.json({ stateFiling: updated });
}
