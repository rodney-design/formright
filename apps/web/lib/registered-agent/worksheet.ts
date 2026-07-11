import { entityFamily } from "@/lib/entities/entityFamily";
import type { RegistrationRow } from "@/lib/entities/orgDataFromRegistration";
import type { StateFilingWorksheetField } from "@/lib/state-filing/types";

interface RegistrationNotesExtra {
  phone?: string;
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

// Northwest Registered Agent's "Wholesale Registered Agent Partnership" is
// sales-gated (phone/email onboarding with a wholesale specialist), not a
// documented self-serve API — see db/migrations/005_registered_agent.sql.
// This worksheet is what staff hand to Northwest when placing an order by
// phone/email, not a request payload for an HTTP call.
export function buildRegisteredAgentOrderPacket(
  reg: RegistrationRow & { state: string; entity_type: string }
): StateFilingWorksheetField[] {
  const extra = parseNotes(reg.notes);
  const address = reg.address;
  const family = entityFamily(reg.entity_type);

  return [
    { label: "Entity name", value: reg.orgname },
    { label: "Entity type", value: family },
    { label: "State of formation", value: reg.state },
    {
      label: "Principal address",
      value: [address?.address, address?.city, address?.zip].filter(Boolean).join(", "),
    },
    { label: "Contact name", value: reg.contact_name ?? "" },
    { label: "Contact email", value: reg.contact_email ?? "" },
    { label: "Contact phone", value: extra.phone || "(not provided)" },
  ];
}
