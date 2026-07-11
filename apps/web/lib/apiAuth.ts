import "server-only";
import type { NextRequest } from "next/server";
import { authenticateApiKey } from "@/lib/queries/apiKeys";

export class ApiAuthError extends Error {}

// REST API v1 (build-order doc §Phase 4 step 3): every /api/v1/* route calls
// this first and scopes its query to the returned firmId — never trusts a
// firm_id passed in the request body/query.
export async function requireApiKeyFirm(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get("authorization");
  const rawKey = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;
  if (!rawKey) throw new ApiAuthError("Missing Authorization: Bearer <api key> header");

  const result = await authenticateApiKey(rawKey);
  if (!result) throw new ApiAuthError("Invalid or revoked API key");

  return result.firmId;
}
