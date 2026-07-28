export type EntityFamily =
  | "llc"
  | "ccorp"
  | "scorp"
  | "benefit"
  | "pc"
  | "sole"
  | "nonprofit";

// Ported from formright_v2_pbc.html entityFamily() (line 28709).
export function entityFamily(et: string | null | undefined): EntityFamily {
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
  if (v.includes("nonprofit") || v.includes("501")) return "nonprofit";
  return "llc"; // default
}
