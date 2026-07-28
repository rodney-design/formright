import "server-only";
import { getFilingProvider } from "./providers";
import { updateStateFiling } from "@/lib/queries/stateFilings";
import type { StateFiling } from "./status";
import type { RegistrationRow } from "@/lib/entities/orgDataFromRegistration";
import { entityFamily } from "@/lib/entities/entityFamily";

interface RegistrationNotesExtra {
  registeredAgentName?: string;
  registeredAgentAddress?: string;
}

function parseNotes(notes: string | null): RegistrationNotesExtra {
  if (!notes) return {};
  try {
    const parsed = JSON.parse(notes);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

// Called right after ensureStateFiling(). If a vendor is configured and
// claims to cover this state, hands the filing off to them and records the
// provider + their filing ID; otherwise leaves the row untouched at
// 'not_submitted'/provider='manual' for the existing worksheet-and-staff flow
// (lib/state-filing/worksheet.ts) to handle. Callers should isolate this in
// its own try/catch, same as the other post-payment side effects in the
// Stripe webhook — a vendor outage must not block payment processing or the
// other side effects.
export async function submitStateFilingToProvider(
  filing: StateFiling,
  reg: RegistrationRow & { state: string; entity_type: string }
): Promise<void> {
  // BUG (fixed): this had no guard against re-submitting a filing that's
  // already been handed off to a vendor. ensureStateFiling() is itself
  // idempotent and returns the existing row on repeat calls, but nothing
  // stopped *this* function from running again for that same row (e.g. a
  // Stripe webhook redelivery hitting this code path a second time) — which
  // would submit a duplicate formation to the vendor and then overwrite
  // provider_filing_id, orphaning any webhook already in flight for the
  // original filing ID (it would 404 against the new one). provider
  // defaults to 'manual' until the first successful submission, so a value
  // other than that means this filing was already handed off.
  if (filing.provider !== "manual") return;

  const provider = getFilingProvider(filing.state);
  if (!provider) return;

  const extra = parseNotes(reg.notes);
  const { providerFilingId } = await provider.submitFormation({
    registrationId: reg.id,
    state: reg.state,
    entityType: entityFamily(reg.entity_type),
    entityName: reg.orgname,
    address: {
      line1: reg.address?.address ?? "",
      city: reg.address?.city ?? "",
      zip: reg.address?.zip ?? "",
    },
    registeredAgentName: extra.registeredAgentName,
    registeredAgentAddress: extra.registeredAgentAddress,
    organizerName: reg.contact_name ?? undefined,
    contactEmail: reg.contact_email ?? undefined,
  });

  await updateStateFiling(filing.id, {
    provider: provider.name,
    providerFilingId,
    filingStatus: "submitted",
  });
}
