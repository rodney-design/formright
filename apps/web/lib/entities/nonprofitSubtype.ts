import type { EntityFamily } from "./entityFamily";

// Legal/filing content specific to each 501(c) subsection FormRight supports.
// Sourced from the Internal Revenue Code (26 U.S.C. § 501(c)) and IRS
// Publication 557 (Tax-Exempt Status for Your Organization) — public-domain
// government guidance, not attorney-drafted advice. This is boilerplate
// purpose/dissolution language of the same kind formation services commonly
// use in Articles of Incorporation; it is not a substitute for review by a
// qualified professional before filing.
export type NonprofitFamily = "nonprofit" | "nonprofit_c4" | "nonprofit_c6" | "nonprofit_c7";

export interface NonprofitSubtypeContent {
  /** Human label, e.g. "501(c)(3) Charitable Organization" */
  label: string;
  /** e.g. "Section 501(c)(3)" */
  ircSection: string;
  /** Articles of Incorporation, Article II — Purpose */
  purposeClause: string;
  /** Articles of Incorporation, Article XI — Dissolution */
  dissolutionClause: string;
  /** Bylaws, Section 1.3 — Tax-Exempt Status */
  bylawsTaxExemptClause: string;
  /** Initial Board Meeting Minutes — EIN/tax-exempt authorization resolution */
  minutesAuthorizationClause: string;
  /** EIN guide — "What is an EIN?" closing sentence */
  einPurposeNote: string;
  /** EIN guide — bullet under "After Receiving Your EIN" */
  einNextStepsBullet: string;
  /** Conflict of Interest Policy cover subtitle */
  conflictSubtitle: string;
  /** Conflict of Interest Policy — IRS requirement callout */
  conflictIntro: string;
  /** Which IRS exemption-recognition form applies, for the IRS Screening step and pricing copy */
  filingForm: string;
  /** One-line filing guidance shown in the IRS Screening step */
  filingGuidance: string;
}

export const NONPROFIT_SUBTYPES: Record<NonprofitFamily, NonprofitSubtypeContent> = {
  nonprofit: {
    label: "501(c)(3) Charitable Organization",
    ircSection: "Section 501(c)(3)",
    purposeClause:
      "The Corporation is organized exclusively for charitable, educational, scientific, and/or literary purposes within the meaning of Section 501(c)(3) of the Internal Revenue Code.",
    dissolutionClause:
      "Upon dissolution, assets shall be distributed for one or more exempt purposes within the meaning of Section 501(c)(3) of the Code, or to the federal, state, or local government for a public purpose.",
    bylawsTaxExemptClause: "The Corporation is organized exclusively for purposes described in Section 501(c)(3) of the Internal Revenue Code.",
    minutesAuthorizationClause:
      "RESOLVED, that the Corporation is authorized to apply for an EIN from the IRS and to file all applications for recognition of 501(c)(3) tax-exempt status.",
    einPurposeNote: "You must obtain it before opening a bank account, hiring staff, or applying for 501(c)(3) status.",
    einNextStepsBullet: "Filing IRS Form 1023 or 1023-EZ",
    conflictSubtitle: "Required for IRS 501(c)(3) Applications",
    conflictIntro: "The IRS requires applicants for 501(c)(3) status to adopt this policy (Form 1023, Schedule O).",
    filingForm: "Form 1023 / 1023-EZ",
    filingGuidance:
      "501(c)(3) organizations apply for formal IRS recognition using Form 1023, or the streamlined Form 1023-EZ if they qualify (projected gross receipts under $50,000 and total assets under $250,000, among other tests).",
  },
  nonprofit_c4: {
    label: "501(c)(4) Social Welfare Organization",
    ircSection: "Section 501(c)(4)",
    purposeClause:
      "The Corporation is organized exclusively to promote social welfare within the meaning of Section 501(c)(4) of the Internal Revenue Code, by operating primarily to further the common good and general welfare of the community.",
    dissolutionClause:
      "Upon dissolution, the Corporation's assets shall be distributed in accordance with the laws of the State of formation and may be distributed to one or more organizations described in Section 501(c) of the Internal Revenue Code, or as otherwise provided by applicable state nonprofit law. Section 501(c)(4) does not require the IRS-mandated charitable distribution applicable to 501(c)(3) organizations.",
    bylawsTaxExemptClause: "The Corporation is organized exclusively for purposes described in Section 501(c)(4) of the Internal Revenue Code.",
    minutesAuthorizationClause:
      "RESOLVED, that the Corporation is authorized to apply for an EIN from the IRS and to file IRS Form 8976, Notice of Intent to Operate Under Section 501(c)(4).",
    einPurposeNote: "You must obtain it before opening a bank account, hiring staff, or filing Form 8976.",
    einNextStepsBullet: "Filing IRS Form 8976 (Notice of Intent to Operate) within 60 days of formation",
    conflictSubtitle: "IRS Best Practice for Section 501(c)(4) Organizations",
    conflictIntro:
      "A conflict of interest policy is not required to file Form 8976, but is IRS best practice and is required if you later seek formal recognition on Form 1024-A.",
    filingForm: "Form 8976 + optional Form 1024-A",
    filingGuidance:
      "501(c)(4) organizations must electronically file Form 8976 (Notice of Intent to Operate) within 60 days of formation to self-declare social welfare status. Formal IRS recognition via Form 1024-A is optional, not required to operate.",
  },
  nonprofit_c6: {
    label: "501(c)(6) Business League",
    ircSection: "Section 501(c)(6)",
    purposeClause:
      "The Corporation is organized exclusively for the promotion of a common business interest of its members within the meaning of Section 501(c)(6) of the Internal Revenue Code, and not for the purpose of engaging in a regular business of a kind ordinarily carried on for profit.",
    dissolutionClause:
      "Upon dissolution, the Corporation's assets shall be distributed in accordance with the laws of the State of formation and may be distributed to one or more organizations described in Section 501(c) of the Internal Revenue Code, or as otherwise provided by applicable state nonprofit law. Section 501(c)(6) does not require the IRS-mandated charitable distribution applicable to 501(c)(3) organizations.",
    bylawsTaxExemptClause: "The Corporation is organized exclusively for purposes described in Section 501(c)(6) of the Internal Revenue Code.",
    minutesAuthorizationClause:
      "RESOLVED, that the Corporation is authorized to apply for an EIN from the IRS and to file IRS Form 1024 for recognition of 501(c)(6) tax-exempt status.",
    einPurposeNote: "You must obtain it before opening a bank account, hiring staff, or filing Form 1024.",
    einNextStepsBullet: "Filing IRS Form 1024 (there is no streamlined \"EZ\" version for 501(c)(6))",
    conflictSubtitle: "Required for IRS Form 1024 Applications",
    conflictIntro: "The IRS requires applicants for 501(c)(6) status to adopt a conflict of interest policy as part of the Form 1024 application.",
    filingForm: "Form 1024",
    filingGuidance:
      "501(c)(6) organizations apply for IRS recognition using Form 1024, the long-form application. There is no streamlined \"EZ\" version for this subsection.",
  },
  nonprofit_c7: {
    label: "501(c)(7) Social Club",
    ircSection: "Section 501(c)(7)",
    purposeClause:
      "The Corporation is organized exclusively for pleasure, recreation, and other nonprofit purposes within the meaning of Section 501(c)(7) of the Internal Revenue Code. Substantially all of the Corporation's activities shall further such purposes, and the Corporation shall be supported primarily by membership fees, dues, and assessments.",
    dissolutionClause:
      "Upon dissolution, the Corporation's assets shall be distributed in accordance with the laws of the State of formation and may be distributed to one or more organizations described in Section 501(c) of the Internal Revenue Code, or as otherwise provided by applicable state nonprofit law. Section 501(c)(7) does not require the IRS-mandated charitable distribution applicable to 501(c)(3) organizations.",
    bylawsTaxExemptClause: "The Corporation is organized exclusively for purposes described in Section 501(c)(7) of the Internal Revenue Code.",
    minutesAuthorizationClause:
      "RESOLVED, that the Corporation is authorized to apply for an EIN from the IRS and to file IRS Form 1024 for recognition of 501(c)(7) tax-exempt status.",
    einPurposeNote: "You must obtain it before opening a bank account, hiring staff, or filing Form 1024.",
    einNextStepsBullet: "Filing IRS Form 1024 (there is no streamlined \"EZ\" version for 501(c)(7))",
    conflictSubtitle: "Required for IRS Form 1024 Applications",
    conflictIntro: "The IRS requires applicants for 501(c)(7) status to adopt a conflict of interest policy as part of the Form 1024 application.",
    filingForm: "Form 1024",
    filingGuidance:
      "501(c)(7) organizations apply for IRS recognition using Form 1024. Keep nonmember income well under IRS limits (generally no more than 35% of gross receipts from nonmembers, no more than 15% from nonmember use of facilities) to preserve exempt status.",
  },
};

export function getNonprofitSubtype(family: EntityFamily): NonprofitSubtypeContent {
  return NONPROFIT_SUBTYPES[family as NonprofitFamily] ?? NONPROFIT_SUBTYPES.nonprofit;
}

export function isNonprofitFamily(family: EntityFamily): family is NonprofitFamily {
  return family === "nonprofit" || family === "nonprofit_c4" || family === "nonprofit_c6" || family === "nonprofit_c7";
}
