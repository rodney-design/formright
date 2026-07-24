// Phase 2: "generate and store" instead of "generate and download" (build-order
// doc §Phase 2 step 2). Generates the doc server-side same as Phase 1, then
// uploads it to Supabase Storage, records a `documents` row (versioned — each
// regeneration gets the next version number for that registration+key), and
// hands back a signed URL instead of streaming the bytes directly.
import "server-only";
import { query } from "@/lib/db";
import { uploadDocument, getDocumentUrl } from "@/lib/storage";
import { generateDocBuffer } from "./generate";
import { build1023EZPrefillPdf } from "./pdf/irs1023ez";
import { DOC_CONFIG } from "./docConfig";
import { getDocsForEntity } from "@/lib/entities/entityDocsMap";
import type { OrgData } from "./types";

const DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PDF_CONTENT_TYPE = "application/pdf";

export interface StoredDocument {
  url: string;
  filename: string;
}

async function nextVersion(registrationId: string, docKey: string): Promise<number> {
  const result = await query<{ max: number | null }>(
    "SELECT MAX(version) as max FROM documents WHERE registration_id = $1 AND doc_key = $2",
    [registrationId, docKey]
  );
  return (result.rows[0]?.max ?? 0) + 1;
}

// key === "narrative_1023" means the IRS 1023-EZ pre-fill PDF here, matching
// the prototype/Phase 1 route's precedence (see docConfig.ts's note: the
// DOC_CONFIG docx entry of the same key is a separate, otherwise-unreachable
// deliverable — preserved as-is from Phase 1, not something to fix here).
export async function generateAndStoreDocument(
  registrationId: string,
  docKey: string,
  entityType: string,
  org: OrgData,
  safeName: string
): Promise<StoredDocument> {
  let buffer: Buffer;
  let filename: string;
  let contentType: string;

  if (docKey === "narrative_1023") {
    buffer = await build1023EZPrefillPdf(org);
    filename = `${safeName}_1023EZ_Prefill.pdf`;
    contentType = PDF_CONTENT_TYPE;
  } else {
    const docs = getDocsForEntity(entityType);
    if (!docs.find((d) => d.key === docKey)) {
      throw new Error("Unknown document key for this entity");
    }
    buffer = await generateDocBuffer(docKey, org);
    const cfg = DOC_CONFIG[docKey];
    filename = `${safeName}_${cfg ? cfg.filename : docKey + ".docx"}`;
    contentType = DOCX_CONTENT_TYPE;
  }

  const version = await nextVersion(registrationId, docKey);
  // documents.s3_key predates this storage backend swap — still the object
  // key column, just no longer literally an S3 key. Left unrenamed to avoid
  // a migration; see lib/storage.ts for the actual backend.
  const storageKey = `documents/${registrationId}/${docKey}-v${version}`;

  await uploadDocument(storageKey, buffer, contentType);
  await query(
    `INSERT INTO documents (registration_id, doc_key, s3_key, filename, version)
     VALUES ($1, $2, $3, $4, $5)`,
    [registrationId, docKey, storageKey, filename, version]
  );

  const url = await getDocumentUrl(storageKey);
  return { url, filename };
}
