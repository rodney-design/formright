// Merged document configuration map.
//
// Ported from formright_v2_pbc.html DOC_CONFIG (nonprofit builders, first
// FORMRIGHT script block) and EXTENDED_DOC_CONFIG (all other entity-family
// builders, second script block), combined into a single map exactly as the
// prototype did at runtime via `Object.assign({}, DOC_CONFIG, EXTENDED_DOC_CONFIG)`
// (see generateDocBlob override in the second script block).
//
// Keys match apps/web/lib/entities/entityDocsMap.ts's ENTITY_DOCS_MAP `key`
// fields exactly — every key referenced there has an entry here.
//
// NOTE: `narrative_1023` is PDF-only in the prototype (handled by
// generate1023EZPrefill(), never routed through generateDocBlob()/toBlob()).
// Its DOC_CONFIG entry here mirrors the source (fn: build1023Narrative,
// producing the .docx *narrative* companion document — a real, separate
// deliverable from the 1023-EZ prefill PDF). See pdf/irs1023ez.ts for the PDF.
//
// NOTE: `license_checklist`'s EXTENDED_DOC_CONFIG entry is reconstructed. The
// uploaded prototype source (formright_v2_pbc.html) is truncated mid-line at
// exactly this entry (`filen` — file ends there), so the literal filename
// string was not recoverable from source. The builder function
// (buildLicenseChecklist) itself is intact and ported verbatim; only the
// filename/title config values are inferred from the established naming
// convention used by every other entry in this file (NN_Title_With_Underscores.docx,
// title matching the corresponding ENTITY_DOCS_MAP title).
import type { OrgData } from "./types";
import {
  buildArticles,
  buildBylaws,
  buildConflict,
  buildEIN,
  buildGift,
  buildMinutes,
  buildResolutions,
  buildRetention,
  buildWhistleblower,
  build1023Narrative,
} from "./builders/nonprofit";
import { buildArticlesLLC, buildOperatingAgreement } from "./builders/llc";
import {
  build83bGuide,
  buildArticlesCorp,
  buildBylawsCorp,
  buildForm2553,
  buildFounderStock,
  buildMinutesCorp,
  buildResolutionsCorp,
  buildStockLedger,
} from "./builders/corp";
import { buildArticlesBenefit, buildBenefitReport } from "./builders/benefit";
import { buildArticlesPC, buildStockTransfer } from "./builders/pc";
import { buildDBAGuide, buildLicenseChecklist } from "./builders/sole";
import type { FileChild } from "docx";

export interface DocConfigEntry {
  fn: (O: OrgData) => FileChild[];
  filename: string;
  title: string;
}

// ── DOC_CONFIG (nonprofit) ──
const DOC_CONFIG_NONPROFIT: Record<string, DocConfigEntry> = {
  articles: { fn: buildArticles, filename: "01_Articles_of_Incorporation.docx", title: "Articles of Incorporation" },
  bylaws: { fn: buildBylaws, filename: "02_Bylaws.docx", title: "Bylaws" },
  conflict: { fn: buildConflict, filename: "03_Conflict_of_Interest_Policy.docx", title: "Conflict of Interest Policy" },
  minutes: { fn: buildMinutes, filename: "04_Initial_Board_Meeting_Minutes.docx", title: "Initial Board Meeting Minutes" },
  ein: { fn: buildEIN, filename: "05_EIN_Application_Guide_SS4.docx", title: "EIN Application Guide" },
  whistleblower: { fn: buildWhistleblower, filename: "06_Whistleblower_Policy.docx", title: "Whistleblower Policy" },
  retention: { fn: buildRetention, filename: "07_Document_Retention_Policy.docx", title: "Document Retention Policy" },
  gift: { fn: buildGift, filename: "08_Gift_Acceptance_Policy.docx", title: "Gift Acceptance Policy" },
  resolutions: { fn: buildResolutions, filename: "09_Board_Resolution_Templates.docx", title: "Board Resolution Templates" },
  narrative_1023: { fn: build1023Narrative, filename: "10_1023_Activity_Narrative.docx", title: "1023 Activity Narrative" },
};

// ── EXTENDED_DOC_CONFIG (all other entity types) ──
const DOC_CONFIG_EXTENDED: Record<string, DocConfigEntry> = {
  // LLC
  articles_llc: { fn: buildArticlesLLC, filename: "01_Articles_of_Organization.docx", title: "Articles of Organization" },
  op_agreement: { fn: buildOperatingAgreement, filename: "02_Operating_Agreement.docx", title: "Operating Agreement" },
  minutes_corp: { fn: buildMinutesCorp, filename: "03_Initial_Meeting_Minutes.docx", title: "Initial Meeting Minutes" },
  // Shared by LLC + all for-profit corp families (ccorp/scorp/benefit/pc) —
  // buildResolutionsCorp() branches internally on entityFamily() the same way
  // buildMinutesCorp() above does. Nonprofit keeps its own separate
  // `resolutions` entry (DOC_CONFIG_NONPROFIT) — never routed through here.
  resolutions_corp: { fn: buildResolutionsCorp, filename: "04_Resolution_Templates.docx", title: "Resolution Templates" },

  // For-profit corps (C, S, Benefit, PC share these)
  articles_corp: { fn: buildArticlesCorp, filename: "01_Articles_of_Incorporation.docx", title: "Articles of Incorporation" },
  bylaws_corp: { fn: buildBylawsCorp, filename: "02_Corporate_Bylaws.docx", title: "Corporate Bylaws" },
  stock_ledger: { fn: buildStockLedger, filename: "03_Stock_Ledger_Cap_Table.docx", title: "Stock Ledger & Cap Table" },
  founder_stock: { fn: buildFounderStock, filename: "04_Founder_Stock_Purchase_Agreement.docx", title: "Founder Stock Purchase Agreement" },
  form_83b: { fn: build83bGuide, filename: "05_83b_Election_Guide.docx", title: "83(b) Election Guide" },
  form_2553: { fn: buildForm2553, filename: "04_Form_2553_SCorp_Election_Guide.docx", title: "IRS Form 2553 — S-Corp Election" },

  // Benefit Corp
  articles_benefit: { fn: buildArticlesBenefit, filename: "01_Articles_of_Incorporation_Benefit.docx", title: "Articles of Incorporation (Benefit Corp)" },
  benefit_report: { fn: buildBenefitReport, filename: "06_Annual_Benefit_Report.docx", title: "Annual Benefit Report Template" },

  // Professional Corp
  articles_pc: { fn: buildArticlesPC, filename: "01_Articles_of_Incorporation_PC.docx", title: "Articles of Incorporation (PC)" },
  stock_transfer: { fn: buildStockTransfer, filename: "05_Stock_Transfer_Restriction_Agreement.docx", title: "Stock Transfer Restriction Agreement" },

  // Sole Prop / DBA
  dba_guide: { fn: buildDBAGuide, filename: "01_DBA_Registration_Guide.docx", title: "DBA Registration Guide" },
  // Reconstructed — see file header note (source truncated at this entry).
  license_checklist: { fn: buildLicenseChecklist, filename: "02_Business_License_Checklist.docx", title: "Local Business License Checklist" },
};

export const DOC_CONFIG: Record<string, DocConfigEntry> = {
  ...DOC_CONFIG_NONPROFIT,
  ...DOC_CONFIG_EXTENDED,
};
