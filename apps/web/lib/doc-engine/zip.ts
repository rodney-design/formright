// Server-side equivalent of downloadAllDocs() (formright_v2_pbc.html, second
// FORMRIGHT script block). The prototype used JSZip in the browser and
// triggered a client-side download; here we build the zip in Node and return
// its Buffer for an API route to stream back.
//
// Filename convention matches the source exactly: `${safeName}_${cfg.filename}`,
// where safeName = O.name.replace(/[^a-z0-9]/gi,'_').
//
// The prototype's downloadAllDocs() explicitly skips the `narrative_1023` key
// when building the docx zip ("if (doc.key === 'narrative_1023') continue; //
// PDF, skip in ZIP") — the 1023-EZ pre-fill is only otherwise reachable via
// its own dashboard button (generate1023EZPrefill()). Per this port's task
// spec, the zip additionally bundles that PDF for nonprofit entities so the
// "download everything" zip is actually complete; this is the one deliberate
// behavioral addition in this file, not a source-verbatim line.
import JSZip from "jszip";
import { entityFamily } from "@/lib/entities/entityFamily";
import { getDocsForEntity } from "@/lib/entities/entityDocsMap";
import { generateDocBuffer } from "./generate";
import { DOC_CONFIG } from "./docConfig";
import { build1023EZPrefillPdf } from "./pdf/irs1023ez";
import type { OrgData } from "./types";

export async function generateAllDocsZip(entityType: string, org: OrgData): Promise<Buffer> {
  const safeName = org.name.replace(/[^a-z0-9]/gi, "_");
  const docs = getDocsForEntity(entityType);
  const zip = new JSZip();
  const preparedBy = org.branding?.firmName ?? "FormRight";
  const folder = zip.folder(`${org.name} — ${preparedBy} Documents`);
  if (!folder) throw new Error("Failed to create zip folder");

  for (const doc of docs) {
    if (doc.key === "narrative_1023") continue; // PDF, skip in ZIP (matches source)
    const buf = await generateDocBuffer(doc.key, org);
    const cfg = DOC_CONFIG[doc.key];
    const fname = safeName + "_" + (cfg ? cfg.filename : doc.key + ".docx");
    folder.file(fname, buf);
  }

  if (entityFamily(entityType) === "nonprofit") {
    const pdfBuf = await build1023EZPrefillPdf(org);
    folder.file(safeName + "_10_1023_EZ_Prefill.pdf", pdfBuf);
  }

  const zipBuf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return zipBuf;
}
