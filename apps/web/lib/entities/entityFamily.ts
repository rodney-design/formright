export type EntityFamily =
  | "llc"
  | "ccorp"
  | "scorp"
  | "benefit"
  | "pc"
  | "sole"
  | "nonprofit" // 501(c)(3) — charitable
  | "nonprofit_c4" // 501(c)(4) — social welfare
  | "nonprofit_c6" // 501(c)(6) — business league
  | "nonprofit_c7"; // 501(c)(7) — social club

// Ported from formright_v2_pbc.html entityFamily() (line 28709). Split into
// a "did this actually match a rule" variant (below) and the always-returns
// variant (entityFamily) so machine callers — the v1 API — can tell an
// unrecognized entity type apart from a real LLC, instead of both silently
// resolving to "llc" the way the onboarding wizard's own free-text dropdown
// labels are allowed to.
export function tryEntityFamily(et: string | null | undefined): EntityFamily | null {
  const v = (et || "").toLowerCase();
  // Checked before the "llc" branch below: the onboarding dropdown option
  // "Professional Corporation (PC/PLLC)" contains the substring "llc" (via
  // "PLLC"), so matching "llc" first misclassified every PC/PLLC signup as an
  // LLC — wrong pricing and wrong legal documents generated.
  if (v.includes("professional") || v.includes("pllc") || /(^|[^a-z])pc([^a-z]|$)/.test(v)) return "pc";
  if (v.includes("llc")) return "llc";
  // Also match the resolved family keys themselves ("ccorp"/"scorp", as stored
  // in registrations.entity_type) so this function is idempotent when fed its
  // own prior output — not just the raw onboarding dropdown strings.
  if (v.includes("c-corp") || v.includes("c corp") || v.includes("ccorp")) return "ccorp";
  if (v.includes("s-corp") || v.includes("s corp") || v.includes("scorp")) return "scorp";
  if (v.includes("benefit")) return "benefit";
  if (v.includes("sole") || v.includes("dba")) return "sole";
  // Check specific nonprofit subsections before the generic 501(c)(3) fallback —
  // each has distinct IRS purpose/dissolution/filing requirements (see
  // lib/entities/nonprofitSubtype.ts). Order matters: "501(c)(4)" etc. must be
  // tested before the bare "nonprofit"/"501" match below.
  if (v.includes("501(c)(4)") || v === "nonprofit_c4") return "nonprofit_c4";
  if (v.includes("501(c)(6)") || v === "nonprofit_c6") return "nonprofit_c6";
  if (v.includes("501(c)(7)") || v === "nonprofit_c7") return "nonprofit_c7";
  if (v.includes("nonprofit") || v.includes("501")) return "nonprofit";
  return null;
}

export function entityFamily(et: string | null | undefined): EntityFamily {
  return tryEntityFamily(et) ?? "llc"; // default
}
