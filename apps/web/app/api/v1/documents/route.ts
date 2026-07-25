import { NextRequest, NextResponse } from "next/server";
import { requireApiKeyFirm, ApiAuthError, RateLimitError } from "@/lib/apiAuth";
import { getVaultDocumentsForFirm } from "@/lib/queries/documents";

export const runtime = "nodejs";

// REST API v1 (build-order doc §Phase 4 step 3). Optional ?registrationId=
// filters to one client's documents; otherwise returns every generated
// document across the firm's clients.
export async function GET(req: NextRequest) {
  let firmId: string;
  try {
    firmId = await requireApiKeyFirm(req);
  } catch (err) {
    if (err instanceof ApiAuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(err.retryAfterSeconds) } }
      );
    }
    throw err;
  }

  const registrationId = req.nextUrl.searchParams.get("registrationId") ?? undefined;
  const documents = await getVaultDocumentsForFirm(firmId, registrationId);
  return NextResponse.json({ documents });
}
