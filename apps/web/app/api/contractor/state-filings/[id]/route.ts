import { NextRequest, NextResponse } from "next/server";
import { requireContractor } from "@/lib/auth";
import { getContractorByUserId } from "@/lib/queries/contractors";
import { getStateFilingById, updateStateFiling, MissingStateConfirmationError } from "@/lib/queries/stateFilings";
import { FILING_STATUSES, type FilingStatus } from "@/lib/state-filing/status";
import { uploadDocument } from "@/lib/storage";

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
    const buffer = Buffer.from(await stampedDoc.arrayBuffer());
    // BUG (fixed): stampedDoc.name came straight from the multipart upload
    // with no sanitization, interpolated directly into the Supabase Storage
    // object key. The [id]-scoped ownership check above is the only access
    // control on this write path — an attacker-controlled filename
    // containing "/" could inject extra path segments into the key,
    // landing outside the intended state-filings/{id}/ prefix in the
    // shared bucket. Strip everything except alphanumerics/dot/dash/
    // underscore, same sanitization pattern used for org names in
    // lib/doc-engine/zip.ts.
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
  if (!updated) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  return NextResponse.json({ stateFiling: updated });
}
