import "server-only";
import { query } from "@/lib/db";
import { getDocumentUrl } from "@/lib/s3";

export interface VaultDocument {
  id: string;
  registrationId: string;
  orgname: string;
  docKey: string;
  filename: string;
  version: number;
  generatedAt: string;
  url: string;
}

// Backing function for GET /api/documents/:userId (build-order doc §Phase 2
// step 3). Only the latest version per registration+doc_key is returned —
// older versions stay in S3/the documents table for history, but aren't
// surfaced in the vault. Pre-signed URLs are generated fresh on every call
// (they expire after 15 minutes — see lib/s3.ts), not stored.
export async function getVaultDocumentsForUser(userId: string): Promise<VaultDocument[]> {
  const result = await query<{
    id: string;
    registration_id: string;
    orgname: string;
    doc_key: string;
    filename: string;
    s3_key: string;
    version: number;
    generated_at: string;
  }>(
    `SELECT DISTINCT ON (d.registration_id, d.doc_key)
       d.id, d.registration_id, r.orgname, d.doc_key, d.filename, d.s3_key, d.version, d.generated_at
     FROM documents d
     JOIN registrations r ON r.id = d.registration_id
     WHERE r.user_id = $1
     ORDER BY d.registration_id, d.doc_key, d.version DESC`,
    [userId]
  );

  return Promise.all(
    result.rows.map(async (row) => ({
      id: row.id,
      registrationId: row.registration_id,
      orgname: row.orgname,
      docKey: row.doc_key,
      filename: row.filename,
      version: row.version,
      generatedAt: row.generated_at,
      url: await getDocumentUrl(row.s3_key),
    }))
  );
}

// REST API v1 (build-order doc §Phase 4 step 3) — same shape as
// getVaultDocumentsForUser, scoped to a firm's clients instead of one user.
export async function getVaultDocumentsForFirm(firmId: string, registrationId?: string): Promise<VaultDocument[]> {
  const result = await query<{
    id: string;
    registration_id: string;
    orgname: string;
    doc_key: string;
    filename: string;
    s3_key: string;
    version: number;
    generated_at: string;
  }>(
    `SELECT DISTINCT ON (d.registration_id, d.doc_key)
       d.id, d.registration_id, r.orgname, d.doc_key, d.filename, d.s3_key, d.version, d.generated_at
     FROM documents d
     JOIN registrations r ON r.id = d.registration_id
     WHERE r.firm_id = $1 AND ($2::text IS NULL OR d.registration_id = $2)
     ORDER BY d.registration_id, d.doc_key, d.version DESC`,
    [firmId, registrationId ?? null]
  );

  return Promise.all(
    result.rows.map(async (row) => ({
      id: row.id,
      registrationId: row.registration_id,
      orgname: row.orgname,
      docKey: row.doc_key,
      filename: row.filename,
      version: row.version,
      generatedAt: row.generated_at,
      url: await getDocumentUrl(row.s3_key),
    }))
  );
}
