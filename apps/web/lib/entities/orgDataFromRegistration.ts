import type { OrgData } from "@/lib/doc-engine/types";
import type { NonprofitSubtype } from "./nonprofitStatutesTable";

const VALID_SUBTYPES: NonprofitSubtype[] = ["public_benefit", "mutual_benefit", "religious"];

export interface RegistrationRow {
  id: string;
  orgname: string;
  entity_type: string;
  state: string;
  address: { address?: string; city?: string; zip?: string } | null;
  ein: string | null;
  mission: string | null;
  fiscal_year: string | null;
  contact_name: string | null;
  contact_email: string | null;
  board: { name: string; role: string; email?: string }[] | null;
  notes: string | null;
}

interface RegistrationNotes {
  orgtypeRaw?: string;
  revenue?: string;
  programs?: string;
  phone?: string;
  nonprofitSubtype?: string;
}

function parseNotes(notes: string | null): RegistrationNotes {
  if (!notes) return {};
  try {
    const parsed = JSON.parse(notes);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

// Maps a `registrations` DB row to the OrgData shape the ported doc-engine
// builder functions expect (mirrors getOrgData() from the prototype).
export function orgDataFromRegistration(reg: RegistrationRow): OrgData {
  const board = reg.board && reg.board.length > 0 ? reg.board.map((m) => ({ name: m.name, role: m.role })) : [
    { name: reg.contact_name ?? "Authorized Representative", role: "President" },
  ];
  const extra = parseNotes(reg.notes);

  return {
    name: reg.orgname,
    state: reg.state,
    address: reg.address?.address ?? "",
    city: reg.address?.city ?? "",
    zip: reg.address?.zip ?? "",
    ein: reg.ein || "Pending",
    mission: reg.mission ?? "",
    fiscal: reg.fiscal_year || "December 31",
    contact: reg.contact_name ?? "",
    ctitle: "Authorized Representative",
    email: reg.contact_email ?? "",
    board,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    year: new Date().getFullYear(),
    // extra.orgtypeRaw (the raw onboarding dropdown string) is preferred when
    // available since it's more specific than the resolved family key, but
    // entityFamily() is idempotent (see entityFamily.ts) so entity_type alone
    // is also safe as a fallback, e.g. for registrations created before notes
    // carried orgtypeRaw, or if an admin overwrote the notes field.
    entityType: extra.orgtypeRaw ?? reg.entity_type,
    revenue: extra.revenue,
    programs: extra.programs,
    phone: extra.phone,
    nonprofitSubtype: VALID_SUBTYPES.includes(extra.nonprofitSubtype as NonprofitSubtype)
      ? (extra.nonprofitSubtype as NonprofitSubtype)
      : undefined,
  };
}
