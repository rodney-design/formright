import "server-only";
import type { NextRequest } from "next/server";
import { authenticateApiKey } from "@/lib/queries/apiKeys";
import { checkRateLimit, RateLimitError } from "@/lib/rateLimit";

export class ApiAuthError extends Error {}
export { RateLimitError };

// REST API v1 (build-order doc §Phase 4 step 3): every /api/v1/* route calls
// this first and scopes its query to the returned firmId — never trusts a
// firm_id passed in the request body/query. Rate limiting (System 4) is
// checked here too, in the one choke point every v1 route already shares,
// rather than duplicated per route or bolted on as separate Next.js
// middleware (which runs on the Edge runtime by default and wouldn't share
// in-process state with these Node.js route handlers).
export async function requireApiKeyFirm(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get("authorization");
  const rawKey = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;
  if (!rawKey) throw new ApiAuthError("Missing Authorization: Bearer <api key> header");

  const result = await authenticateApiKey(rawKey);
  if (!result) throw new ApiAuthError("Invalid or revoked API key");

  checkRateLimit(result.firmId);

  return result.firmId;
}
