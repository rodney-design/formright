import { NextRequest, NextResponse } from "next/server";
import { requireApiKeyFirm, ApiAuthError, RateLimitError } from "@/lib/apiAuth";
import { getRegistrationById } from "@/lib/queries/registrations";
import { getStateFilingForRegistration } from "@/lib/queries/stateFilings";

export const runtime = "nodejs";

// REST API v1 (build-order doc §Phase 4 step 3): "filing status
// webhook/polling" surfaced for firms — since state filing itself is
// manually tracked (see lib/state-filing/), this is polling-only; there's
// no outbound webhook to firms yet.
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

  const registrationId = req.nextUrl.searchParams.get("registrationId");
  if (!registrationId) {
    return NextResponse.json({ error: "Missing registrationId" }, { status: 400 });
  }

  const reg = await getRegistrationById(registrationId);
  if (!reg || reg.firm_id !== firmId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stateFiling = await getStateFilingForRegistration(registrationId);

  return NextResponse.json({
    registrationId: reg.id,
    status: reg.status,
    stateFiling: stateFiling
      ? {
          status: stateFiling.filing_status,
          stateConfirmationId: stateFiling.state_confirmation_id,
          submittedAt: stateFiling.submitted_at,
        }
      : null,
  });
}
