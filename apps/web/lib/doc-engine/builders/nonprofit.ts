// Nonprofit entity-family document builders.
//
// Ported verbatim from formright_v2_pbc.html FORMRIGHT DOCUMENT GENERATION
// ENGINE script block: buildArticles, buildBylaws, buildConflict,
// buildMinutes, buildEIN, buildWhistleblower, buildRetention, buildGift,
// buildResolutions, build1023Narrative. All legal/policy copy is preserved
// exactly as in the source — do not reword.
import {
  BorderStyle,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { blank, coverBlock, divider, h1, h2, h3, p } from "../helpers";
import type { OrgData } from "../types";

function bdr(c: string) {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: c },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: c },
    left: { style: BorderStyle.SINGLE, size: 1, color: c },
    right: { style: BorderStyle.SINGLE, size: 1, color: c },
  };
}

export function buildArticles(O: OrgData) {
  return [
    ...coverBlock(O, "Articles of Incorporation", `A Nonprofit Corporation · State of ${O.state}`),
    h1("Articles of Incorporation"),
    p(`State of ${O.state}`, { bold: true, color: "475569" }),
    blank(),
    h2("Article I — Name"),
    p(`The name of this corporation is ${O.name} (the "Corporation").`),
    blank(),
    h2("Article II — Nonprofit Purpose"),
    p(
      `The Corporation is organized exclusively for charitable, educational, scientific, and/or literary purposes within the meaning of Section 501(c)(3) of the Internal Revenue Code.`
    ),
    p(`Mission: "${O.mission}"`, { italic: true }),
    blank(),
    h2("Article III — Principal Office"),
    p(`${O.address}, ${O.city}, ${O.state} ${O.zip}`),
    blank(),
    h2("Article IV — Registered Agent"),
    p(`The Corporation shall maintain a registered agent in the State of ${O.state} as required by law.`),
    blank(),
    h2("Article V — Membership"),
    p("The Corporation shall have no members as defined under applicable state law."),
    blank(),
    h2("Article VI — Board of Directors"),
    p("The initial Directors of the Corporation are:"),
    ...O.board.map((m) => p(`${m.name} — ${m.role}`, { numbering: "bullets" })),
    blank(),
    h2("Article VII — Limitation of Director Liability"),
    p("No Director shall be personally liable for monetary damages for breach of fiduciary duty, except as required by applicable law."),
    blank(),
    h2("Article VIII — Indemnification"),
    p("The Corporation shall indemnify each Director, officer, employee, and agent to the fullest extent permitted by applicable law."),
    blank(),
    h2("Article IX — Prohibition on Private Inurement"),
    p("No part of net earnings shall inure to the benefit of any Director, officer, or private person."),
    blank(),
    h2("Article X — Political Activity"),
    p(
      "No substantial part of the Corporation's activities shall consist of lobbying or attempting to influence legislation. The Corporation shall not participate in political campaigns."
    ),
    blank(),
    h2("Article XI — Dissolution"),
    p(
      `Upon dissolution, assets shall be distributed for one or more exempt purposes within the meaning of Section 501(c)(3) of the Code, or to the federal, state, or local government for a public purpose.`
    ),
    blank(),
    h2("Article XII — Incorporator"),
    p(`Name: ${O.contact}`, { bold: true }),
    p(`Address: ${O.address}, ${O.city}, ${O.state} ${O.zip}`),
    blank(480),
    divider(),
    p("IN WITNESS WHEREOF, the undersigned incorporator has executed these Articles on the date set forth below.", { after: 480 }),
    p("Signature: _______________________________", { after: 80 }),
    p(`${O.contact}, Incorporator`, { after: 80 }),
    p(`Date: ${O.date}`),
  ];
}

export function buildBylaws(O: OrgData) {
  return [
    ...coverBlock(O, "Organizational Bylaws", "Governing Document · IRS-Compliant"),
    h1(`Bylaws of ${O.name}`),
    p("Adopted: " + O.date, { color: "475569" }),
    blank(),
    h2("Article I — Name and Purpose"),
    h3("Section 1.1 — Name"),
    p(`The name of this corporation is ${O.name}.`),
    h3("Section 1.2 — Mission"),
    p(`"${O.mission}"`),
    h3("Section 1.3 — Tax-Exempt Status"),
    p("The Corporation is organized exclusively for purposes described in Section 501(c)(3) of the Internal Revenue Code."),
    blank(),
    h2("Article II — Principal Office"),
    p(`The principal office shall be at ${O.address}, ${O.city}, ${O.state} ${O.zip}.`),
    blank(),
    h2("Article III — Board of Directors"),
    h3("Section 3.1 — General Powers"),
    p("The Board of Directors shall manage the business and affairs of the Corporation."),
    h3("Section 3.2 — Number"),
    p("The Board shall consist of no fewer than three (3) and no more than fifteen (15) Directors."),
    h3("Section 3.3 — Term"),
    p("Each Director shall serve a two (2)-year term, renewable for up to two consecutive terms."),
    h3("Section 3.4 — Election"),
    p("Directors shall be elected by a majority vote of the existing Board."),
    h3("Section 3.5 — Vacancies"),
    p("Vacancies shall be filled by majority vote of the remaining Directors."),
    h3("Section 3.6 — Removal"),
    p("Any Director may be removed by a two-thirds (2/3) vote of the full Board."),
    h3("Section 3.7 — Compensation"),
    p("Directors shall serve without compensation but may be reimbursed for reasonable expenses."),
    blank(),
    h2("Article IV — Meetings"),
    h3("Section 4.1 — Regular Meetings"),
    p("The Board shall meet no fewer than four (4) times per year."),
    h3("Section 4.2 — Special Meetings"),
    p("Special meetings may be called by the President or any three (3) Directors with five (5) days notice."),
    h3("Section 4.3 — Quorum"),
    p("A majority (51%) of Directors then serving constitutes a quorum."),
    h3("Section 4.4 — Remote Participation"),
    p("Directors may participate by telephone or video conference, constituting presence in person."),
    blank(),
    h2("Article V — Officers"),
    h3("Section 5.1 — Officers"),
    p("Officers shall include a President, Vice President, Secretary, and Treasurer."),
    h3("Section 5.2 — Election"),
    p("Officers shall be elected annually by the Board."),
    h3("Section 5.3 — Removal"),
    p("Any officer may be removed by a two-thirds (2/3) vote of the Board."),
    blank(),
    h2("Article VI — Fiscal Year"),
    p(`The fiscal year of the Corporation shall end on ${O.fiscal} of each year.`),
    blank(),
    h2("Article VII — Amendments"),
    p("These Bylaws may be amended by a two-thirds (2/3) vote of the full Board at any duly noticed meeting."),
    blank(480),
    divider(),
    p("CERTIFICATION OF ADOPTION", { bold: true, align: "center", after: 240 }),
    p("President: _______________________________     Date: ________________", { after: 120 }),
    p("Secretary: _______________________________     Date: ________________"),
  ];
}

export function buildConflict(O: OrgData) {
  return [
    ...coverBlock(O, "Conflict of Interest Policy", "Required for IRS 501(c)(3) Applications"),
    h1("Conflict of Interest Policy"),
    p("Adopted: " + O.date, { color: "475569" }),
    blank(),
    p("IMPORTANT: The IRS requires applicants for 501(c)(3) status to adopt this policy (Form 1023, Schedule O).", {
      bold: true,
      italic: true,
      color: "1B9AAA",
      after: 240,
    }),
    h2("Article I — Purpose"),
    p(
      `This policy protects the tax-exempt interest of ${O.name} when contemplating transactions that might benefit the private interests of an officer or Director.`
    ),
    blank(),
    h2("Article II — Definitions"),
    h3("Section 2.1 — Interested Person"),
    p("Any Director, principal officer, or committee member with Board-delegated powers who has a direct or indirect financial interest."),
    h3("Section 2.2 — Financial Interest"),
    p(
      "A person has a financial interest if they have, directly or indirectly, through business, investment, or family: an ownership interest in any entity with which the Corporation transacts; a compensation arrangement with the Corporation; or a potential ownership interest in any entity the Corporation is negotiating with."
    ),
    blank(),
    h2("Article III — Procedures"),
    h3("Section 3.1 — Duty to Disclose"),
    p("Interested Persons must disclose any financial interest and allow full disclosure of all material facts before any vote on the matter."),
    h3("Section 3.2 — Recusal"),
    p("After disclosure, the Interested Person shall leave the meeting while the conflict is discussed and voted upon."),
    h3("Section 3.3 — Violations"),
    p(
      "If the Board believes a member failed to disclose a conflict, the member shall be informed and given an opportunity to respond before any disciplinary action."
    ),
    blank(),
    h2("Article IV — Records"),
    p(
      "Minutes shall document: persons who disclosed conflicts, the nature of the interest, actions taken, decisions reached, and votes of those present."
    ),
    blank(),
    h2("Article V — Annual Statements"),
    p("Each Director and officer shall annually sign a statement affirming receipt, understanding, and agreement to comply with this policy."),
    blank(),
    h2("Article VI — Periodic Reviews"),
    p(
      "Periodic reviews shall confirm that compensation arrangements are reasonable and arm's length, and that partnerships further charitable purposes without private benefit."
    ),
    blank(480),
    divider(),
    p("ANNUAL DISCLOSURE STATEMENT", { bold: true, align: "center", after: 240 }),
    p(`I acknowledge receipt of the Conflict of Interest Policy of ${O.name} and agree to comply with it.`, { after: 320 }),
    p("Name (Print): _______________________________", { after: 120 }),
    p("Signature: _______________________________", { after: 120 }),
    p("Title: _______________________________", { after: 120 }),
    p("Date: _______________________________"),
  ];
}

export function buildMinutes(O: OrgData) {
  const infoTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2500, 6860],
    rows: [
      ["Date:", O.date],
      ["Time:", "___:___ AM/PM"],
      ["Location:", `${O.address}, ${O.city}, ${O.state}`],
      ["Presiding Officer:", O.board[0]?.name || O.contact],
    ].map(
      ([l, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 2500, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              shading: { fill: "E6F7F9", type: ShadingType.CLEAR },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: l, font: "Arial", size: 22, bold: true, color: "0D1B2A" })] })],
            }),
            new TableCell({
              width: { size: 6860, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: v, font: "Arial", size: 22 })] })],
            }),
          ],
        })
    ),
  });
  return [
    ...coverBlock(O, "Initial Board Meeting Minutes", "Organizational Meeting of the Board of Directors"),
    h1("Minutes of the Organizational Meeting of the Board of Directors"),
    p(O.name, { bold: true }),
    blank(),
    infoTable,
    blank(240),
    h2("I. Directors Present"),
    ...O.board.map((m) => p(`${m.name} — ${m.role}`, { numbering: "bullets" })),
    blank(),
    p("A quorum of Directors being present, the meeting was called to order."),
    blank(),
    h2("II. Adoption of Articles of Incorporation"),
    p(
      `RESOLVED, that the Articles of Incorporation of ${O.name} are hereby approved and the officers are authorized to execute and file such Articles with the Secretary of State of ${O.state}.`,
      { italic: true, color: "0D1B2A" }
    ),
    blank(),
    h2("III. Adoption of Bylaws"),
    p(`RESOLVED, that the Bylaws presented are hereby adopted as the Bylaws of ${O.name}.`, { italic: true, color: "0D1B2A" }),
    blank(),
    h2("IV. Election of Officers"),
    ...O.board.map((m) => p(`${m.role}: ${m.name}`, { numbering: "bullets" })),
    blank(),
    h2("V. Adoption of Conflict of Interest Policy"),
    p(`RESOLVED, that the Conflict of Interest Policy is hereby adopted and each Director shall execute an annual disclosure statement.`, {
      italic: true,
      color: "0D1B2A",
    }),
    blank(),
    h2("VI. Authorization to Apply for EIN & Tax-Exempt Status"),
    p(
      `RESOLVED, that the Corporation is authorized to apply for an EIN from the IRS and to file all applications for recognition of 501(c)(3) tax-exempt status.`,
      { italic: true, color: "0D1B2A" }
    ),
    blank(),
    h2("VII. Fiscal Year"),
    p(`RESOLVED, that the fiscal year of the Corporation shall end on ${O.fiscal}.`, { italic: true, color: "0D1B2A" }),
    blank(),
    h2("VIII. Adjournment"),
    p("There being no further business, the meeting was adjourned."),
    blank(480),
    divider(),
    p("Secretary: _______________________________     Date: ________________"),
  ];
}

export function buildEIN(O: OrgData) {
  const infoTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3600, 5760],
    rows: [
      ["Line 1 — Legal Name", O.name],
      ["Line 3 — Responsible Party", O.contact],
      ["Line 4a — Mailing Address", O.address],
      ["Line 4b — City, State, ZIP", `${O.city}, ${O.state} ${O.zip}`],
      ["Line 8a — Entity Type", "Other nonprofit organization"],
      ["Line 9a — Reason for Applying", "Started new business"],
      ["Line 10 — Date Business Started", O.date],
      ["Line 11 — Fiscal Year End", O.fiscal.split(" ")[0]],
    ].map(
      ([l, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3600, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              shading: { fill: "E6F7F9", type: ShadingType.CLEAR },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: l, font: "Arial", size: 20, bold: true, color: "0D1B2A" })] })],
            }),
            new TableCell({
              width: { size: 5760, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: v, font: "Arial", size: 20 })] })],
            }),
          ],
        })
    ),
  });
  return [
    ...coverBlock(O, "EIN Application Guide", "IRS Form SS-4 — Employer Identification Number"),
    h1("EIN Application Guide — IRS Form SS-4"),
    p("Prepared by FormRight | " + O.date, { color: "475569" }),
    blank(),
    p("This guide provides step-by-step instructions for obtaining your Federal Employer Identification Number (EIN).", {
      italic: true,
      color: "1B9AAA",
    }),
    blank(),
    h2("What is an EIN?"),
    p(
      "An EIN is a unique nine-digit federal tax ID number (XX-XXXXXXX) for your organization. You must obtain it before opening a bank account, hiring staff, or applying for 501(c)(3) status."
    ),
    blank(),
    h2("How to Apply Online (Free, Instant)"),
    p("Step 1:", { bold: true, after: 40 }),
    p('Go to IRS.gov → Businesses → Apply for EIN Online'),
    p("Step 2:", { bold: true, after: 40 }),
    p('Select "View Additional Types, Including Tax-Exempt" → "Other Nonprofit/Tax-Exempt Organizations"'),
    p("Step 3:", { bold: true, after: 40 }),
    p('Select "Started a new business" as the reason for applying'),
    p("Step 4:", { bold: true, after: 40 }),
    p("Complete the form using your pre-filled information below"),
    blank(),
    h2("Your Pre-Filled SS-4 Information"),
    infoTable,
    blank(240),
    h2("After Receiving Your EIN"),
    p("Record your EIN immediately and save your CP 575 confirmation letter. You will need it for:", { bold: true }),
    p("Opening your bank account", { numbering: "bullets" }),
    p("Filing IRS Form 1023 or 1023-EZ", { numbering: "bullets" }),
    p("State registrations and grant applications", { numbering: "bullets" }),
    blank(),
    p(`Your EIN: ___-_______`, { bold: true, size: 28, color: "1B9AAA" }),
    p("(Record here once received)", { italic: true, color: "475569" }),
  ];
}

export function buildWhistleblower(O: OrgData) {
  return [
    ...coverBlock(O, "Whistleblower Policy", "Protection for Reporting Financial & Legal Violations"),
    h1("Whistleblower Policy"),
    p("Adopted: " + O.date, { color: "475569" }),
    blank(),
    h2("I. Purpose"),
    p(
      `${O.name} requires Directors, officers, employees, and volunteers to observe high standards of ethics in the conduct of their duties. This policy establishes procedures for reporting violations without fear of retaliation.`
    ),
    blank(),
    h2("II. Reporting Responsibility"),
    p("All Directors, officers, employees, and volunteers are responsible for reporting violations or suspected violations in accordance with this policy."),
    blank(),
    h2("III. No Retaliation"),
    p(
      "It is contrary to the values of the Corporation for anyone to retaliate against any person who in good faith reports an ethics violation or suspected violation of law. Retaliation is subject to discipline up to termination."
    ),
    blank(),
    h2("IV. Reporting Procedure"),
    p("Concerns may be reported to a supervisor, the Board President, or any Board member. Written reports may be sent to:"),
    blank(),
    p(`Board President: ${O.board[0]?.name || O.contact}`, { bold: true }),
    p(`${O.name}`),
    p(`${O.address}`),
    p(`${O.city}, ${O.state} ${O.zip}`),
    p(`Email: ${O.email}`),
    blank(),
    h2("V. Accounting and Auditing Matters"),
    p("The Board or Audit Committee shall address all reported concerns regarding accounting practices, internal controls, or auditing."),
    blank(),
    h2("VI. Good Faith Requirement"),
    p("Complaints must be made in good faith with reasonable grounds. Allegations made maliciously or known to be false are a serious disciplinary offense."),
    blank(),
    h2("VII. Confidentiality"),
    p("Reports may be submitted confidentially or anonymously. Reports will be kept confidential to the extent possible, consistent with the need to investigate."),
    blank(),
    h2("VIII. Handling of Reports"),
    p(
      "The Board President will acknowledge receipt of any complaint and ensure it is promptly investigated. Appropriate corrective action will be taken if warranted."
    ),
    blank(480),
    divider(),
    p("ACKNOWLEDGMENT", { bold: true, align: "center", after: 240 }),
    p(`I acknowledge receipt of the Whistleblower Policy of ${O.name} and agree to comply.`, { after: 320 }),
    p("Name: _______________________________", { after: 120 }),
    p("Signature: _______________________________", { after: 120 }),
    p("Date: _______________________________"),
  ];
}

export function buildRetention(O: OrgData) {
  const hdrRow = new TableRow({
    tableHeader: true,
    children: [
      { t: "Record Type", w: 4200 },
      { t: "Retention Period", w: 2080 },
      { t: "Notes", w: 3080 },
    ].map(
      ({ t, w }) =>
        new TableCell({
          width: { size: w, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          shading: { fill: "0D1B2A", type: ShadingType.CLEAR },
          borders: bdr("0D1B2A"),
          children: [new Paragraph({ children: [new TextRun({ text: t, font: "Arial", size: 20, bold: true, color: "FFFFFF" })] })],
        })
    ),
  });
  const rows = [
    ["Articles of Incorporation", "Permanent", "Original in fireproof storage"],
    ["Bylaws (all versions)", "Permanent", "Keep superseded versions"],
    ["Board Meeting Minutes", "Permanent", "Signed originals"],
    ["IRS Determination Letter", "Permanent", "Tax-exempt status proof"],
    ["IRS Form 990 (annual)", "7 years", "Federal requirement"],
    ["Financial Statements", "7 years", "Audited or reviewed"],
    ["Bank Statements", "7 years", "All accounts"],
    ["General Ledger", "7 years", "All fiscal years"],
    ["Payroll Records", "7 years", "Federal/state requirement"],
    ["Contracts & Agreements", "7 years after expiration", "All signed agreements"],
    ["Grant Records", "7 years after grant close", "Per funder requirements"],
    ["Donor Acknowledgment Letters", "7 years", "IRS substantiation"],
    ["Employee Files", "7 years after termination", "Personnel records"],
    ["Insurance Policies", "10 years after expiration", "Claims may arise later"],
    ["Real Property Records", "Permanent", "Deeds, mortgages"],
    ["Correspondence — Legal", "7 years", "Substantive legal matters"],
    ["Correspondence — General", "3 years", "Routine communications"],
    ["Program Records", "5 years", "Service delivery docs"],
    ["Email — Routine", "1 year", "Non-substantive"],
    ["Volunteer Records", "3 years", "Service logs"],
  ].map(
    ([type, period, notes]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 4200, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: bdr("E2E8F0"),
            children: [new Paragraph({ children: [new TextRun({ text: type, font: "Arial", size: 20 })] })],
          }),
          new TableCell({
            width: { size: 2080, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
            borders: bdr("E2E8F0"),
            children: [new Paragraph({ children: [new TextRun({ text: period, font: "Arial", size: 20, bold: period === "Permanent" })] })],
          }),
          new TableCell({
            width: { size: 3080, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: bdr("E2E8F0"),
            children: [new Paragraph({ children: [new TextRun({ text: notes, font: "Arial", size: 18, italics: true, color: "475569" })] })],
          }),
        ],
      })
  );
  const table = new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [4200, 2080, 3080], rows: [hdrRow, ...rows] });
  return [
    ...coverBlock(O, "Document Retention Policy", "Records Management & Legal Compliance"),
    h1("Document Retention Policy"),
    p("Adopted: " + O.date, { color: "475569" }),
    blank(),
    h2("I. Purpose"),
    p(
      `This policy establishes standards for record retention and destruction for ${O.name}, ensuring compliance with applicable law and protecting the Corporation's operational integrity.`
    ),
    p("Note: Federal law (Sarbanes-Oxley Act) makes it a crime to alter or destroy documents to prevent their use in an official proceeding."),
    blank(),
    h2("II. Responsibility"),
    p(`The ${O.board[2]?.role || "Secretary"} is responsible for administering this policy, training staff, and overseeing record destruction.`),
    blank(),
    h2("III. Litigation Hold"),
    p("If the Corporation is served with a subpoena or anticipates litigation, record destruction shall be immediately suspended until the matter is resolved."),
    blank(),
    h2("IV. Retention Schedule"),
    table,
    blank(240),
    h2("V. Electronic Records"),
    p("Electronic records (email, digital files, cloud storage) are subject to the same retention requirements as paper records."),
    blank(),
    h2("VI. Destruction of Records"),
    p(
      "Records past their retention period shall be destroyed appropriately: paper records shredded, electronic records permanently deleted. A destruction log shall be maintained by the Secretary."
    ),
    blank(),
    divider(),
    p("Approved by the Board of Directors of " + O.name, { after: 240 }),
    p("President: _______________________________", { after: 120 }),
    p("Secretary: _______________________________", { after: 120 }),
    p("Date: " + O.date),
  ];
}

export function buildGift(O: OrgData) {
  return [
    ...coverBlock(O, "Gift Acceptance Policy", "Donor Relations & Charitable Contributions"),
    h1("Gift Acceptance Policy"),
    p("Adopted: " + O.date, { color: "475569" }),
    blank(),
    h2("I. Purpose and Scope"),
    p(
      `This policy governs the acceptance of gifts by ${O.name}, protecting the interests of the Corporation and its donors. It applies to all gifts regardless of form or amount.`
    ),
    blank(),
    h2("II. Gifts Accepted Without Prior Review"),
    h3("A. Cash"),
    p("The Corporation accepts cash gifts in any form — check, credit card, wire transfer, ACH, or online payment. All gifts shall be promptly receipted."),
    h3("B. Checks"),
    p(`All checks shall be made payable to "${O.name}." Checks payable to individuals on behalf of the Corporation will not be accepted.`),
    h3("C. Publicly Traded Securities"),
    p("The Corporation accepts publicly traded stocks, bonds, and mutual fund shares. Securities will generally be sold promptly upon receipt."),
    blank(),
    h2("III. Gifts Requiring Prior Approval"),
    h3("A. Closely Held Business Interests"),
    p("Gifts of interests in closely held businesses require legal and tax review before acceptance."),
    h3("B. Real Estate"),
    p("Real estate gifts require an independent appraisal, Phase I environmental assessment, clear title, and approval by a two-thirds vote of the Board."),
    h3("C. Tangible Personal Property"),
    p("Accepted only if consistent with mission, usable or convertible to cash, and without significant cost."),
    h3("D. Bequests and Planned Gifts"),
    p("The Corporation welcomes bequests, charitable remainder trusts, and life insurance beneficiary designations."),
    h3("E. Cryptocurrency"),
    p("May be accepted subject to Board approval. Cryptocurrency shall be converted to U.S. dollars within five (5) business days of receipt."),
    blank(),
    h2("IV. Restricted Gifts"),
    p(
      "The Corporation may accept restricted gifts if the restriction is consistent with mission, fulfillable, and not unreasonably burdensome. The Corporation reserves the right to decline any restricted gift."
    ),
    blank(),
    h2("V. Gifts the Corporation Will Not Accept"),
    p(
      "Gifts that would violate applicable law, compromise tax-exempt status, require actions contrary to mission, involve excessive liability, or compromise the Corporation's independence.",
      { numbering: "bullets" }
    ),
    blank(),
    h2("VI. Donor Acknowledgment"),
    p(
      "All gifts of $250 or more shall receive written IRS-compliant acknowledgment. Non-cash gifts over $500 require donor-filed Form 8283. Gifts over $5,000 require a qualified appraisal."
    ),
    blank(),
    h2("VII. Valuation"),
    p("The Corporation does not provide valuations for donated property. The Corporation will sign Form 8283 to acknowledge receipt only, not to confirm valuation."),
    blank(480),
    divider(),
    p("Approved by the Board of Directors of " + O.name, { after: 240 }),
    p("President: _______________________________", { after: 120 }),
    p("Secretary: _______________________________", { after: 120 }),
    p("Date: " + O.date),
  ];
}

export function buildResolutions(O: OrgData) {
  const metaTable = () =>
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2000, 7360],
      rows: [
        ["Organization:", O.name],
        ["Date:", O.date],
        ["Meeting Type:", "☐ Regular  ☐ Special  ☐ Written Consent"],
        ["Vote:", "☐ Unanimous  ☐ __ For / __ Against / __ Abstain"],
      ].map(
        ([l, v]) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2000, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                shading: { fill: "E6F7F9", type: ShadingType.CLEAR },
                borders: bdr("E2E8F0"),
                children: [new Paragraph({ children: [new TextRun({ text: l, font: "Arial", size: 20, bold: true, color: "0D1B2A" })] })],
              }),
              new TableCell({
                width: { size: 7360, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                borders: bdr("E2E8F0"),
                children: [new Paragraph({ children: [new TextRun({ text: v, font: "Arial", size: 20 })] })],
              }),
            ],
          })
      ),
    });
  return [
    ...coverBlock(O, "Board Resolution Templates", "Standard Resolutions for Common Governance Actions"),
    h1("Board Resolution Templates"),
    p("Complete the bracketed fields and record the vote in meeting minutes.", { italic: true, color: "475569" }),
    blank(),

    h2("Resolution 1 — Authorization of Bank Account"),
    metaTable(),
    blank(160),
    p(
      `RESOLVED, that the Corporation is authorized to open and maintain a bank account at [BANK NAME], and the following officers are authorized as signatories:`,
      { italic: true }
    ),
    blank(80),
    p("Authorized Signatory 1: _______________________________  Title: _______________", { after: 100 }),
    p("Authorized Signatory 2: _______________________________  Title: _______________"),
    blank(240),
    p("Secretary: _______________________________     Date: ________________"),
    blank(),
    divider(),
    blank(),

    h2("Resolution 2 — Approval of Annual Budget"),
    p(
      `RESOLVED, that the Board of Directors of ${O.name} approves the operating budget for fiscal year ending [DATE], in the total amount of $[AMOUNT], attached as Exhibit A.`,
      { italic: true }
    ),
    blank(240),
    p("Secretary: _______________________________     Date: ________________"),
    blank(),
    divider(),
    blank(),

    h2("Resolution 3 — Appointment of Executive Director"),
    p(
      `RESOLVED, that the Board hereby appoints [NAME] as Executive Director, effective [START DATE], at an annual salary of $[SALARY], subject to an employment agreement executed by the Board President.`,
      { italic: true }
    ),
    blank(240),
    p("Secretary: _______________________________     Date: ________________"),
    blank(),
    divider(),
    blank(),

    h2("Resolution 4 — Authorization to Apply for Grants"),
    p(
      `RESOLVED, that the Executive Director and/or Board President are authorized to submit grant applications to [FUNDER NAME(S)] and execute all related agreements on behalf of ${O.name}.`,
      { italic: true }
    ),
    blank(240),
    p("Secretary: _______________________________     Date: ________________"),
    blank(),
    divider(),
    blank(),

    h2("Resolution 5 — Amendment of Bylaws"),
    p(`RESOLVED, that the Bylaws of ${O.name} are hereby amended as follows:`, { italic: true }),
    blank(80),
    p("[DESCRIBE AMENDMENT HERE]", { color: "1B9AAA", italic: true }),
    blank(80),
    p("Note: Bylaw amendments require a two-thirds (2/3) vote of the full Board.", { bold: true, color: "475569" }),
    blank(240),
    p("Secretary: _______________________________     Date: ________________"),
    blank(),
    divider(),
    blank(),

    h2("Resolution 6 — Written Consent in Lieu of Meeting"),
    p("The undersigned, being all of the Directors, hereby consent to and adopt the following resolution without a meeting:", { italic: true }),
    blank(80),
    p("[INSERT RESOLUTION TEXT HERE]", { color: "1B9AAA", italic: true }),
    blank(240),
    ...O.board.map(
      (m) =>
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({ text: `${m.name}, ${m.role}:  _______________________________    Date: ________`, font: "Arial", size: 22 })],
        })
    ),
  ];
}

export function build1023Narrative(O: OrgData) {
  // ── Derive revenue tier from onboarding if available ──
  // Prototype read `window._adminDocgenOverride || window.onboardState`;
  // ported to read the corresponding optional fields on OrgData instead.
  const revenue = O.revenue || "Under $50,000";
  const programs = O.programs || O.mission;
  const formType = revenue === "Under $50,000" ? "1023-EZ" : "Full Form 1023";
  const partLabel = formType === "1023-EZ" ? "Part IV — Description of Activities" : "Part IV — Narrative Description of Activities";

  // ── Eligibility summary table ──
  const eligRows: [string, string][] = [
    ["Organization Name", O.name],
    ["State of Incorporation", O.state],
    ["Fiscal Year End", O.fiscal],
    ["Responsible Party", O.contact + (O.ctitle ? ", " + O.ctitle : "")],
    ["Contact Email", O.email],
    ["Projected Annual Gross Receipts", revenue],
    ["Recommended Form", formType],
  ];
  const eligTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3800, 5560],
    rows: eligRows.map(
      ([label, val]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3800, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              shading: { fill: "E6F7F9", type: ShadingType.CLEAR },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: label, font: "Arial", size: 20, bold: true, color: "0D1B2A" })] })],
            }),
            new TableCell({
              width: { size: 5560, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: val, font: "Arial", size: 20 })] })],
            }),
          ],
        })
    ),
  });

  // ── Build narrative paragraphs ──
  // Para 1 — Organization overview & purpose
  const para1 = `${O.name} (the "Organization") is a nonprofit corporation incorporated under the laws of the State of ${O.state}. The Organization was formed exclusively for charitable, educational, and/or religious purposes within the meaning of Section 501(c)(3) of the Internal Revenue Code. Its fiscal year ends on ${O.fiscal}.`;

  // Para 2 — Mission
  const para2 = `The mission of ${O.name} is as follows: ${O.mission.trim().replace(/\.?\s*$/, ".")} The Organization is committed to advancing this mission in a manner that serves the public interest and provides no private benefit to any individual beyond what is reasonable and necessary to carry out its exempt purposes.`;

  // Para 3 — Programs & activities (uses the programs field from Step 2)
  const para3Text =
    programs && programs.trim().length > 20
      ? programs.trim()
      : `${O.name} carries out its mission through direct service programs, community partnerships, and educational initiatives. All programs are designed to further the Organization's exempt purposes and provide meaningful benefit to the community it serves.`;
  const para3 = `The Organization will carry out its exempt purposes through the following programs and activities: ${para3Text.replace(/\.?\s*$/, ".")}`;

  // Para 4 — Governance & structure
  const boardNames = O.board
    .slice(0, 3)
    .map((m) => `${m.name} (${m.role})`)
    .join(", ");
  const para4 = `${O.name} is governed by a Board of Directors consisting of at least three (3) unrelated, independent directors. Initial directors include ${boardNames}${
    O.board.length > 3 ? `, and ${O.board.length - 3} additional director${O.board.length - 3 > 1 ? "s" : ""}` : ""
  }. The Board meets at least quarterly and is responsible for fiduciary oversight, strategic direction, and ensuring compliance with applicable laws.`;

  // Para 5 — Public benefit & private inurement
  const para5 = `No part of the net earnings of ${O.name} will inure to the benefit of, or be distributable to, its directors, officers, or other private individuals, except for reasonable compensation for services rendered. ${O.name} will not carry on propaganda or otherwise attempt to influence legislation as a substantial part of its activities, and will not participate or intervene in any political campaign on behalf of any candidate for public office. In the event of dissolution, all assets remaining after payment of liabilities will be distributed to one or more organizations described in Section 501(c)(3) of the Internal Revenue Code.`;

  // Para 6 — Fundraising & financial
  const para6 = `${O.name} anticipates raising funds through individual donations, foundation grants, government contracts, program service fees (if applicable), and community fundraising events. All funds received will be used exclusively to further the Organization’s charitable purposes. The Organization will maintain accurate financial records, file all required tax returns including IRS Form 990 (or 990-EZ/990-N as applicable), and comply with all state reporting requirements.`;

  // ── Checklist table ──
  const checkItems: [string, string][] = [
    ["Articles of Incorporation filed with state", "Required before IRS filing"],
    ["Bylaws adopted by Board", "Required — attach to application"],
    ["Conflict of Interest Policy adopted", "Required for 1023/1023-EZ"],
    ["Initial Board Meeting Minutes completed", "Documents governance structure"],
    ["EIN obtained from IRS (Form SS-4)", "Required before filing 1023"],
    ["Whistleblower Policy adopted", "IRS best practice; required for 990"],
    ["Document Retention Policy adopted", "IRS best practice"],
    ["Gift Acceptance Policy adopted", "Recommended for all organizations"],
    ["Board Resolution Templates prepared", "Authorize key organizational actions"],
    ["This 1023 Narrative Activity Statement complete", "Attach to " + formType + " application"],
  ];
  const checkHdr = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 5760, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        shading: { fill: "0D1B2A", type: ShadingType.CLEAR },
        borders: bdr("0D1B2A"),
        children: [new Paragraph({ children: [new TextRun({ text: "Item", font: "Arial", size: 20, bold: true, color: "FFFFFF" })] })],
      }),
      new TableCell({
        width: { size: 1000, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        shading: { fill: "0D1B2A", type: ShadingType.CLEAR },
        borders: bdr("0D1B2A"),
        children: [new Paragraph({ children: [new TextRun({ text: "Done", font: "Arial", size: 20, bold: true, color: "FFFFFF" })] })],
      }),
      new TableCell({
        width: { size: 2600, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        shading: { fill: "0D1B2A", type: ShadingType.CLEAR },
        borders: bdr("0D1B2A"),
        children: [new Paragraph({ children: [new TextRun({ text: "Notes", font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })],
      }),
    ],
  });
  const checkRows = checkItems.map(
    ([item, note]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 5760, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: bdr("E2E8F0"),
            children: [new Paragraph({ children: [new TextRun({ text: item, font: "Arial", size: 18 })] })],
          }),
          new TableCell({
            width: { size: 1000, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: bdr("E2E8F0"),
            children: [new Paragraph({ children: [new TextRun({ text: "☐", font: "Arial", size: 20 })] })],
          }),
          new TableCell({
            width: { size: 2600, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
            borders: bdr("E2E8F0"),
            children: [new Paragraph({ children: [new TextRun({ text: note, font: "Arial", size: 18, italics: true, color: "475569" })] })],
          }),
        ],
      })
  );
  const checkTable = new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [5760, 1000, 2600], rows: [checkHdr, ...checkRows] });

  return [
    ...coverBlock(O, "1023 Activity Narrative", `IRS Form ${formType} — Description of Activities`),

    h1("IRS Form 1023 — Activity Narrative Statement"),
    p(`Prepared by FormRight  |  ${O.date}`, { color: "475569" }),
    blank(),

    p(
      "This document provides a pre-filled narrative for Part IV of your IRS tax-exemption application. Review carefully, supplement with any additional program details, and attach to your application.",
      { italic: true, color: "1B9AAA" }
    ),
    blank(),

    h2("Organization Summary"),
    eligTable,
    blank(240),

    h2("Recommended Application Form"),
    p(
      revenue === "Under $50,000"
        ? "Based on your projected revenue of under $50,000, you likely qualify for the streamlined IRS Form 1023-EZ. This form is shorter, filed online at pay.gov, and currently processed in 2–4 weeks."
        : "Based on your projected revenue, you will need to file the full IRS Form 1023. This form requires more detailed narrative, financial projections, and supporting documents. Processing currently takes 6–12 months.",
      { color: revenue === "Under $50,000" ? "166534" : "B45309" }
    ),
    blank(),

    h2(partLabel),
    p("The following narrative statement has been generated from your onboarding information. Review each paragraph, expand where noted, and confirm accuracy before submission.", {
      italic: true,
      color: "475569",
      after: 240,
    }),

    p("Paragraph 1 — Organization Overview", { bold: true, color: "0D1B2A", after: 80 }),
    p(para1),
    blank(160),

    p("Paragraph 2 — Mission & Exempt Purpose", { bold: true, color: "0D1B2A", after: 80 }),
    p(para2),
    blank(160),

    p("Paragraph 3 — Programs & Activities", { bold: true, color: "0D1B2A", after: 80 }),
    p(para3),
    p("Tip: Expand this section with specific program names, target population sizes, service frequency, and measurable outcomes if possible. The IRS looks for concrete detail.", {
      italic: true,
      color: "1B9AAA",
      size: 18,
      after: 160,
    }),
    blank(80),

    p("Paragraph 4 — Governance Structure", { bold: true, color: "0D1B2A", after: 80 }),
    p(para4),
    blank(160),

    p("Paragraph 5 — Public Benefit & Restrictions", { bold: true, color: "0D1B2A", after: 80 }),
    p(para5),
    blank(160),

    p("Paragraph 6 — Fundraising & Financial Plan", { bold: true, color: "0D1B2A", after: 80 }),
    p(para6),
    blank(240),

    divider(),

    h2("Authorized Signature"),
    p(`I declare under penalty of perjury that I have examined this activity narrative and, to the best of my knowledge, it is true, correct, and complete.`, { after: 240 }),
    p("Signature: _______________________________________________", { after: 120 }),
    p(`Printed Name: ${O.contact}`, { after: 120 }),
    p(`Title: ${O.ctitle || "Authorized Officer"}`, { after: 120 }),
    p("Date: ________________"),
    blank(480),

    divider(),

    h2("Pre-Filing Document Checklist"),
    p(`Complete all items below before submitting your ${formType} application to the IRS.`, { after: 160 }),
    checkTable,
    blank(240),

    p("Questions? Contact FormRight at support@rightform.org", { italic: true, color: "475569", align: "center" }),
  ];
}
