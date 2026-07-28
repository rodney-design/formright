// Phase 2: "generate and store" instead of "generate and download" (build-order
// doc §Phase 2 step 2). Generates the doc server-side same as Phase 1, then
// uploads it to Supabase Storage, records a `documents` row (versioned — each
// regeneration gets the next version number for that registration+key), and
// hands back a signed URL instead of streaming the bytes directly.
import "server-only";
import type { PoolClient } from "pg";
import { withClient } from "@/lib/db";
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

async function nextVersion(client: PoolClient, registrationId: string, docKey: string): Promise<number> {
  const result = await client.query<{ max: number | null }>(
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

  return withClient(async (client) => {
    // BUG (fixed): nextVersion() used to be a plain SELECT MAX(version) then
    // INSERT with no locking. There's no unique constraint on
    // (registration_id, doc_key, version) to catch a collision, so two
    // concurrent regenerations of the same document (a double-clicked
    // download link, two open tabs) could both compute the same next
    // version, both upload to the *same* storage object key — one silently
    // clobbering the other — and both insert a `documents` row claiming
    // that version, with no error anywhere. An advisory lock scoped to this
    // transaction, keyed on (registrationId, docKey), serializes the whole
    // version-assign + upload + insert sequence per document instead.
    await client.query("BEGIN");
    try {
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [`${registrationId}:${docKey}`]);
      const version = await nextVersion(client, registrationId, docKey);
      // documents.s3_key predates this storage backend swap — still the object
      // key column, just no longer literally an S3 key. Left unrenamed to avoid
      // a migration; see lib/storage.ts for the actual backend.
      const storageKey = `documents/${registrationId}/${docKey}-v${version}`;

      await uploadDocument(storageKey, buffer, contentType);
      await client.query(
        `INSERT INTO documents (registration_id, doc_key, s3_key, filename, version)
         VALUES ($1, $2, $3, $4, $5)`,
        [registrationId, docKey, storageKey, filename, version]
      );
      await client.query("COMMIT");

      const url = await getDocumentUrl(storageKey);
      return { url, filename };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  });
}
