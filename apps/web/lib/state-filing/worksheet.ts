import { entityFamily } from "@/lib/entities/entityFamily";
import type { RegistrationRow } from "@/lib/entities/orgDataFromRegistration";
import type { StateFilingWorksheet } from "./types";

interface RegistrationNotesExtra {
  registeredAgentName?: string;
  registeredAgentAddress?: string;
}

function parseNotes(notes: Record<string, unknown> | null): RegistrationNotesExtra {
  return (notes ?? {}) as RegistrationNotesExtra;
}

// None of FormRight's 5 priority states (DE/CA/FL/NY/TX) expose a documented,
// official programmatic filing API as of the Phase 3 research pass — every
// one is a web portal, some requiring an account (e.g. Texas's
// SOSDirect/SOSUpload). So this isn't an HTTP submission adapter — it's a
// worksheet staff transcribe into that state's own portal by hand, paired
// with the manual status tracking in lib/queries/stateFilings.ts. If a state
// opens a real filing API later, replace this call site with a real
// submission client; the state_filings table/status flow underneath it
// doesn't need to change.
export function buildFilingWorksheet(reg: RegistrationRow & { state: string; entity_type: string }): StateFilingWorksheet {
  const extra = parseNotes(reg.notes);
  const address = reg.address;
  const family = entityFamily(reg.entity_type);

  const fields: StateFilingWorksheet["fields"] = [
    { label: "Entity name", value: reg.orgname },
    { label: "Entity type", value: family },
    { label: "State", value: reg.state },
    {
      label: "Principal address",
      value: [address?.address, address?.city, address?.zip].filter(Boolean).join(", "),
    },
    { label: "Registered agent name", value: extra.registeredAgentName || "(not provided)" },
    { label: "Registered agent address", value: extra.registeredAgentAddress || "(not provided)" },
    { label: "Organizer / incorporator", value: reg.contact_name ?? "" },
    { label: "Contact email", value: reg.contact_email ?? "" },
  ];

  (reg.board ?? []).forEach((m, i) => {
    fields.push({ label: `Board/member ${i + 1}`, value: `${m.name} — ${m.role}` });
  });

  return { state: reg.state, entityType: family, fields };
}
