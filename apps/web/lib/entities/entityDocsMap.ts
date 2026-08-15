import { entityFamily, type EntityFamily } from "./entityFamily";

export interface EntityDoc {
  key: string;
  icon: string;
  title: string;
  desc: string;
}

// Ported from formright_v2_pbc.html ENTITY_DOCS_MAP (line 28722).
export const ENTITY_DOCS_MAP: Record<EntityFamily, EntityDoc[]> = {
  llc: [
    { key: "articles_llc", icon: "\u{1F4C4}", title: "Articles of Organization", desc: "State-specific LLC formation document" },
    { key: "op_agreement", icon: "\u{1F4CB}", title: "Operating Agreement", desc: "Single or multi-member governance" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
    { key: "minutes_corp", icon: "\u{1F4DD}", title: "Initial Member Meeting Minutes", desc: "Organizational meeting documentation" },
    { key: "resolutions_corp", icon: "\u{1F3DB}️", title: "Member Resolution Templates", desc: "Standard LLC resolutions" },
  ],
  ccorp: [
    { key: "articles_corp", icon: "\u{1F4C4}", title: "Articles of Incorporation", desc: "State formation document" },
    { key: "bylaws_corp", icon: "\u{1F4CB}", title: "Corporate Bylaws", desc: "For-profit governance document" },
    { key: "stock_ledger", icon: "\u{1F4CA}", title: "Stock Ledger & Cap Table", desc: "Equity tracking template" },
    { key: "founder_stock", icon: "\u{1F4D1}", title: "Founder Stock Purchase Agreement", desc: "Restricted stock with vesting" },
    { key: "form_83b", icon: "\u{1F4EE}", title: "83(b) Election Guide", desc: "IRS election filing instructions" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
    { key: "minutes_corp", icon: "\u{1F4DD}", title: "Initial Board Meeting Minutes", desc: "Organizational meeting documentation" },
    { key: "resolutions_corp", icon: "\u{1F3DB}️", title: "Board Resolution Templates", desc: "Standard corporate resolutions" },
  ],
  scorp: [
    { key: "articles_corp", icon: "\u{1F4C4}", title: "Articles of Incorporation", desc: "State formation document" },
    { key: "bylaws_corp", icon: "\u{1F4CB}", title: "Corporate Bylaws", desc: "For-profit governance document" },
    { key: "form_2553", icon: "\u{1F4EE}", title: "IRS Form 2553 — S-Corp Election", desc: "S-Corp election filing guide" },
    { key: "stock_ledger", icon: "\u{1F4CA}", title: "Stock Ledger", desc: "Shareholder equity tracking" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
    { key: "minutes_corp", icon: "\u{1F4DD}", title: "Initial Board Meeting Minutes", desc: "Organizational meeting documentation" },
    { key: "resolutions_corp", icon: "\u{1F3DB}️", title: "Board Resolution Templates", desc: "Standard corporate resolutions" },
  ],
  nonprofit: [
    { key: "articles", icon: "\u{1F4C4}", title: "Articles of Incorporation", desc: "Nonprofit formation document" },
    { key: "bylaws", icon: "\u{1F4CB}", title: "Bylaws", desc: "IRS-compliant governance document" },
    { key: "conflict", icon: "⚖️", title: "Conflict of Interest Policy", desc: "Required for IRS 1023 filing" },
    { key: "minutes", icon: "\u{1F4DD}", title: "Initial Board Meeting Minutes", desc: "Pre-filled resolutions" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
    { key: "whistleblower", icon: "\u{1F6E1}️", title: "Whistleblower Policy", desc: "Required governance policy" },
    { key: "retention", icon: "\u{1F5C2}️", title: "Document Retention Policy", desc: "Records management policy" },
    { key: "gift", icon: "\u{1F381}", title: "Gift Acceptance Policy", desc: "Donor contribution guidelines" },
    { key: "resolutions", icon: "\u{1F3DB}️", title: "Board Resolution Templates", desc: "8 standard resolutions" },
    { key: "narrative_1023", icon: "\u{1F4D1}", title: "1023 Activity Narrative", desc: "IRS Part IV description" },
  ],
  // 501(c)(4)/(6)/(7) share the same document set and builder functions as
  // 501(c)(3) (each builder branches on O.entityType — see
  // lib/entities/nonprofitSubtype.ts for the purpose/dissolution/filing text
  // specific to each subsection). The 1023 Activity Narrative is intentionally
  // excluded: Form 1023/1023-EZ only exists for 501(c)(3).
  nonprofit_c4: [
    { key: "articles", icon: "\u{1F4C4}", title: "Articles of Incorporation", desc: "Nonprofit formation document" },
    { key: "bylaws", icon: "\u{1F4CB}", title: "Bylaws", desc: "Governance document" },
    { key: "conflict", icon: "⚖️", title: "Conflict of Interest Policy", desc: "IRS best practice · required for Form 1024-A" },
    { key: "minutes", icon: "\u{1F4DD}", title: "Initial Board Meeting Minutes", desc: "Pre-filled resolutions" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
    { key: "whistleblower", icon: "\u{1F6E1}️", title: "Whistleblower Policy", desc: "Recommended governance policy" },
    { key: "retention", icon: "\u{1F5C2}️", title: "Document Retention Policy", desc: "Records management policy" },
    { key: "resolutions", icon: "\u{1F3DB}️", title: "Board Resolution Templates", desc: "8 standard resolutions" },
  ],
  nonprofit_c6: [
    { key: "articles", icon: "\u{1F4C4}", title: "Articles of Incorporation", desc: "Nonprofit formation document" },
    { key: "bylaws", icon: "\u{1F4CB}", title: "Bylaws", desc: "Governance document" },
    { key: "conflict", icon: "⚖️", title: "Conflict of Interest Policy", desc: "Required for IRS Form 1024 filing" },
    { key: "minutes", icon: "\u{1F4DD}", title: "Initial Board Meeting Minutes", desc: "Pre-filled resolutions" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
    { key: "retention", icon: "\u{1F5C2}️", title: "Document Retention Policy", desc: "Records management policy" },
    { key: "resolutions", icon: "\u{1F3DB}️", title: "Board Resolution Templates", desc: "8 standard resolutions" },
  ],
  nonprofit_c7: [
    { key: "articles", icon: "\u{1F4C4}", title: "Articles of Incorporation", desc: "Nonprofit formation document" },
    { key: "bylaws", icon: "\u{1F4CB}", title: "Bylaws", desc: "Governance document" },
    { key: "conflict", icon: "⚖️", title: "Conflict of Interest Policy", desc: "Required for IRS Form 1024 filing" },
    { key: "minutes", icon: "\u{1F4DD}", title: "Initial Board Meeting Minutes", desc: "Pre-filled resolutions" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
    { key: "retention", icon: "\u{1F5C2}️", title: "Document Retention Policy", desc: "Records management policy" },
    { key: "resolutions", icon: "\u{1F3DB}️", title: "Board Resolution Templates", desc: "8 standard resolutions" },
  ],
  benefit: [
    { key: "articles_benefit", icon: "\u{1F4C4}", title: "Articles of Incorporation", desc: "Includes benefit purpose statement" },
    { key: "bylaws_corp", icon: "\u{1F4CB}", title: "Corporate Bylaws", desc: "Benefit corp governance document" },
    { key: "benefit_report", icon: "\u{1F30D}", title: "Annual Benefit Report Template", desc: "Stakeholder impact reporting" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
    { key: "minutes_corp", icon: "\u{1F4DD}", title: "Initial Board Meeting Minutes", desc: "Organizational meeting documentation" },
    { key: "resolutions_corp", icon: "\u{1F3DB}️", title: "Board Resolution Templates", desc: "Standard corporate resolutions" },
  ],
  pc: [
    { key: "articles_pc", icon: "\u{1F4C4}", title: "Articles of Incorporation (PC)", desc: "Professional corp formation document" },
    { key: "bylaws_corp", icon: "\u{1F4CB}", title: "Professional Corporation Bylaws", desc: "PC-specific governance document" },
    { key: "stock_transfer", icon: "\u{1F4D1}", title: "Stock Transfer Restriction Agreement", desc: "Limits shares to licensed professionals" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
    { key: "minutes_corp", icon: "\u{1F4DD}", title: "Initial Board Meeting Minutes", desc: "Organizational meeting documentation" },
    { key: "resolutions_corp", icon: "\u{1F3DB}️", title: "Board Resolution Templates", desc: "Standard corporate resolutions" },
  ],
  sole: [
    { key: "dba_guide", icon: "\u{1F4C4}", title: "DBA Registration Guide", desc: "Fictitious business name filing" },
    { key: "license_checklist", icon: "\u{1F4CB}", title: "Local Business License Checklist", desc: "State & county permit requirements" },
    { key: "ein", icon: "\u{1F522}", title: "EIN Application Guide (SS-4)", desc: "IRS employer ID instructions" },
  ],
};

// Ported from getDocsForEntity() (line 28784).
export function getDocsForEntity(entityType: string | null | undefined): EntityDoc[] {
  const family = entityFamily(entityType);
  return ENTITY_DOCS_MAP[family] || ENTITY_DOCS_MAP.llc;
}
