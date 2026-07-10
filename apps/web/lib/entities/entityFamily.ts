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
  if (v.includes("llc")) return "llc";
  if (v.includes("c-corp") || v.includes("c corp")) return "ccorp";
  if (v.includes("s-corp") || v.includes("s corp")) return "scorp";
  if (v.includes("benefit")) return "benefit";
  if (v.includes("professional") || v.includes("pc") || v.includes("pllc")) return "pc";
  if (v.includes("sole") || v.includes("dba")) return "sole";
  if (v.includes("nonprofit") || v.includes("501")) return "nonprofit";
  return "llc"; // default
}
