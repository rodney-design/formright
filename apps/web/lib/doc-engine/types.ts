// Shape of the data object consumed by every document builder function.
//
// Ported from formright_v2_pbc.html getOrgData() (FORMRIGHT DOCUMENT
// GENERATION ENGINE script block). In the prototype this was assembled from
// `window.onboardState` with demo-data fallbacks; here it is a required-field
// interface — the caller (typically a server action reading a `registrations`
// row) is responsible for supplying real data. Builders remain pure
// data-in/data-out functions per brief §3.2.
import type { NonprofitStatute, NonprofitSubtype } from "../entities/nonprofitStatutesTable";

export interface BoardMember {
  name: string;
  role: string;
}

// Phase 4 white-label PDF generation (build-order doc §Phase 4 step 2):
// applied to cover pages and headers/footers only, not document body text —
// the builder functions' body content has dozens of hardcoded brand-color
// literals per file, and rethreading a branding param through all of them
// is out of scope here. logoImage is pre-fetched bytes (see
// lib/doc-engine/branding.ts), not a URL, since the docx builders are pure
// synchronous functions.
export interface DocBranding {
  firmName?: string;
  primaryColor?: string;
  logoImage?: { data: Buffer; type: "png" | "jpg" | "gif" | "bmp" };
}

export interface OrgData {
  name: string;
  state: string;
  address: string;
  city: string;
  zip: string;
  ein: string;
  mission: string;
  fiscal: string;
  contact: string;
  ctitle: string;
  email: string;
  board: BoardMember[];
  date: string;
  year: number;

  // Optional fields referenced by individual builders (1023-EZ PDF, Form 2553,
  // etc.) that were read directly off `window.onboardState`/`O` in the
  // prototype without a fallback in getOrgData(). Kept optional here so
  // callers that don't have this data can omit it, matching the prototype's
  // effective behavior of `undefined`/empty-string when absent.
  phone?: string;
  website?: string;
  incDate?: string;
  /** Projected annual gross receipts band, e.g. 'Under $50,000'. Drives the 1023 vs 1023-EZ recommendation in build1023Narrative(). */
  revenue?: string;
  /** Free-text programs/activities description from onboarding Step 2, used verbatim in build1023Narrative() when long enough. */
  programs?: string;

  /**
   * Raw entity type string (e.g. "LLC", "C-Corp", "S-Corp", "Professional Corporation").
   * In the prototype, builders shared across entity families (buildArticlesCorp,
   * buildBylawsCorp, buildMinutesCorp) read this off `window.onboardState.entityType`
   * via getEntityType()/entityFamily() at call time rather than off the O object
   * returned by getOrgData(). Since this port has no global browser state, the
   * value is threaded through OrgData instead so those builders stay pure
   * functions of their single argument. Pass the same value used to select the
   * doc key from ENTITY_DOCS_MAP / getDocsForEntity().
   */
  entityType?: string;

  /** Set when this document is generated for a Pro-tier firm's client formation. */
  branding?: DocBranding;

  /**
   * California nonprofit corporation-law sub-type (public benefit / mutual
   * benefit / religious — see nonprofitStatutesTable.ts). Set from an
   * explicit onboarding selection when the founder is incorporating a
   * nonprofit in California (StepOrganization.tsx); otherwise left undefined
   * and the call site derives a default via deriveCaliforniaSubtype().
   * Meaningless outside California today, since no other seeded state splits
   * nonprofit corporations into sub-types.
   */
  nonprofitSubtype?: NonprofitSubtype;

  /**
   * Resolved per-state nonprofit statutory reference (see
   * lib/entities/nonprofitStatutesTable.ts) — only set for nonprofit-family
   * registrations in a seeded state. Builders stay pure/synchronous, so the
   * async DB lookup happens at the call site (the document-generation route)
   * before OrgData is constructed, same pattern as `branding` above.
   */
  nonprofitStatute?: NonprofitStatute | null;
}
