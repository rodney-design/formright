import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getFirmMembershipForUser } from "@/lib/queries/firms";
import { entityFamily } from "@/lib/entities/entityFamily";
import { getDocsForEntity } from "@/lib/entities/entityDocsMap";
import { orgDataFromRegistration, type RegistrationRow } from "@/lib/entities/orgDataFromRegistration";
import { generateAllDocsZip } from "@/lib/doc-engine/zip";
import { generateAndStoreDocument } from "@/lib/doc-engine/generateAndStore";
import { getFirmBrandingForRegistration } from "@/lib/doc-engine/branding";
import { getNonprofitStatute, deriveCaliforniaSubtype } from "@/lib/entities/nonprofitStatutesTable";
import { PAID_REGISTRATION_STATUSES } from "@/lib/registrationStatus";

export const runtime = "nodejs";

// 'pending', which /api/checkout writes *before* Stripe payment completes,
// must not unlock the generated document package.
const PAID_STATUSES = new Set<string>(PAID_REGISTRATION_STATUSES);

async function loadRegistration(registrationId: string, userId: string, isAdmin: boolean, memberFirmId: string | null) {
  const result = await query<RegistrationRow & { user_id: string; entity_type: string; status: string; firm_id: string | null }>(
    "SELECT * FROM registrations WHERE id = $1",
    [registrationId]
  );
  const reg = result.rows[0];
  if (!reg) return null;
  if (isAdmin) return reg;
  const owns = reg.user_id === userId || (memberFirmId !== null && reg.firm_id === memberFirmId);
  if (!owns) return null;
  if (!PAID_STATUSES.has(reg.status)) return null;
  return reg;
}

// Phase 2: generate-and-store (build-order doc §Phase 2 step 2) — instead of
// streaming the generated file straight back, this generates it, uploads to
// S3, records a `documents` row, and redirects to a pre-signed URL. The zip
// ("all") path is a bundle rather than a single named document, so it's kept
// as a direct stream, same as Phase 1.
export async function GET(req: NextRequest, { params }: { params: { registrationId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const membership = isAdmin ? null : await getFirmMembershipForUser(user.id);
  const reg = await loadRegistration(params.registrationId, user.id, isAdmin, membership?.firm.id ?? null);
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const org = orgDataFromRegistration(reg);
  org.branding = await getFirmBrandingForRegistration(reg.firm_id);
  const family = entityFamily(reg.entity_type);
  if (family === "nonprofit") {
    const subtype = org.state === "California" ? org.nonprofitSubtype ?? deriveCaliforniaSubtype(org.entityType) : null;
    org.nonprofitStatute = await getNonprofitStatute(org.state, subtype);
  }
  const key = req.nextUrl.searchParams.get("key");
  const wantsAll = req.nextUrl.searchParams.get("all") === "1";
  const safeName = org.name.replace(/[^a-z0-9]/gi, "_");

  if (wantsAll) {
    const zipBuffer = await generateAllDocsZip(family, org);
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeName}_FormRight_Documents.zip"`,
      },
    });
  }

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  if (key !== "narrative_1023") {
    const docs = getDocsForEntity(reg.entity_type);
    if (!docs.find((d) => d.key === key)) {
      return NextResponse.json({ error: "Unknown document key for this entity" }, { status: 400 });
    }
  }

  const { url } = await generateAndStoreDocument(reg.id, key, reg.entity_type, org, safeName);
  return NextResponse.redirect(url);
}
