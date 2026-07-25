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
