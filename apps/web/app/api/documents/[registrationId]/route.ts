import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { entityFamily } from "@/lib/entities/entityFamily";
import { getDocsForEntity } from "@/lib/entities/entityDocsMap";
import { orgDataFromRegistration, type RegistrationRow } from "@/lib/entities/orgDataFromRegistration";
import { generateDocBuffer } from "@/lib/doc-engine/generate";
import { generateAllDocsZip } from "@/lib/doc-engine/zip";
import { build1023EZPrefillPdf } from "@/lib/doc-engine/pdf/irs1023ez";

export const runtime = "nodejs";

async function loadRegistration(registrationId: string, userId: string, isAdmin: boolean) {
  const result = await query<RegistrationRow & { user_id: string; entity_type: string }>(
    "SELECT * FROM registrations WHERE id = $1",
    [registrationId]
  );
  const reg = result.rows[0];
  if (!reg) return null;
  if (!isAdmin && reg.user_id !== userId) return null;
  return reg;
}

export async function GET(req: NextRequest, { params }: { params: { registrationId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const reg = await loadRegistration(params.registrationId, user.id, isAdmin);
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const org = orgDataFromRegistration(reg);
  const family = entityFamily(reg.entity_type);
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

  if (key === "narrative_1023") {
    const pdfBuffer = await build1023EZPrefillPdf(org);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}_1023EZ_Prefill.pdf"`,
      },
    });
  }

  const docs = getDocsForEntity(reg.entity_type);
  const docMeta = docs.find((d) => d.key === key);
  if (!docMeta) {
    return NextResponse.json({ error: "Unknown document key for this entity" }, { status: 400 });
  }

  const buffer = await generateDocBuffer(key, org);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${safeName}_${key}.docx"`,
    },
  });
}
