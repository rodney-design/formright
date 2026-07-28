import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateIrsFiling } from "@/lib/queries/irsFilings";
import { IRS_FILING_STATUSES, type IrsFilingStatus } from "@/lib/irs-filing/status";
import { uploadDocument } from "@/lib/storage";

export const runtime = "nodejs";

// Manual federal-status update — no IRS API exists for Form 1023/1023-EZ
// status, so staff check the org's pay.gov / IRS Tax Exempt Organization
// Search account and record the result here, same posture as
// api/admin/state-filings/[id]/route.ts for the state side.
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

  const statusRaw = formData.get("status");
  const ein = formData.get("ein");
  const determinationLetter = formData.get("determinationLetter");

  const update: { status?: IrsFilingStatus; ein?: string; determinationLetterS3Key?: string } = {};

  if (typeof statusRaw === "string" && statusRaw) {
    if (!IRS_FILING_STATUSES.includes(statusRaw as IrsFilingStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = statusRaw as IrsFilingStatus;
  }
  if (typeof ein === "string" && ein) {
    update.ein = ein;
  }
  if (determinationLetter instanceof File && determinationLetter.size > 0) {
    const buffer = Buffer.from(await determinationLetter.arrayBuffer());
    const storageKey = `irs-filings/${params.id}/determination_${Date.now()}_${determinationLetter.name}`;
    await uploadDocument(storageKey, buffer, determinationLetter.type || "application/pdf");
    update.determinationLetterS3Key = storageKey;
  }

  // BUG (fixed): updateIrsFiling() returns null both when `update` came in
  // empty and when params.id doesn't match any row — this route used to
  // treat both as the same 400 "Nothing to update", so a bad/stale filing
  // ID silently looked like a client input error instead of a 404.
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await updateIrsFiling(params.id, update);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ irsFiling: updated });
}
