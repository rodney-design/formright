import "server-only";
import crypto from "crypto";
import { query } from "@/lib/db";

const KEY_PREFIX = "fr_live_";

function hashKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export interface ApiKeySummary {
  id: string;
  created_at: string;
  revoked_at: string | null;
}

// The raw key is only ever returned here, at creation time — only its hash
// is persisted (api_keys.key_hash), same pattern as password/token storage
// elsewhere in this app.
export async function createApiKey(firmId: string): Promise<{ id: string; rawKey: string }> {
  const rawKey = `${KEY_PREFIX}${crypto.randomBytes(24).toString("hex")}`;
  const result = await query<{ id: string }>(
    "INSERT INTO api_keys (firm_id, key_hash) VALUES ($1, $2) RETURNING id",
    [firmId, hashKey(rawKey)]
  );
  return { id: result.rows[0].id, rawKey };
}

export async function listApiKeysForFirm(firmId: string): Promise<ApiKeySummary[]> {
  const result = await query<ApiKeySummary>(
    "SELECT id, created_at, revoked_at FROM api_keys WHERE firm_id = $1 ORDER BY created_at DESC",
    [firmId]
  );
  return result.rows;
}

export async function revokeApiKey(id: string, firmId: string): Promise<boolean> {
  const result = await query(
    "UPDATE api_keys SET revoked_at = now() WHERE id = $1 AND firm_id = $2 AND revoked_at IS NULL",
    [id, firmId]
  );
  return (result.rowCount ?? 0) > 0;
}

// REST API v1 auth (build-order doc §Phase 4 step 3): resolves a raw
// `Authorization: Bearer <key>` value to the firm it belongs to, or null if
// the key is unknown/revoked.
export async function authenticateApiKey(rawKey: string): Promise<{ firmId: string } | null> {
  const result = await query<{ firm_id: string }>(
    "SELECT firm_id FROM api_keys WHERE key_hash = $1 AND revoked_at IS NULL",
    [hashKey(rawKey)]
  );
  const row = result.rows[0];
  return row ? { firmId: row.firm_id } : null;
}
