// For-profit corporation document builders shared across the ccorp/scorp/
// benefit/pc entity families.
//
// Ported verbatim from formright_v2_pbc.html (second FORMRIGHT script block):
// buildArticlesCorp, buildBylawsCorp, buildStockLedger, buildFounderStock,
// build83bGuide, buildForm2553, buildMinutesCorp.
//
// The prototype determined entity subtype (isPC / isSCorp / isLLC) by reading
// `window.onboardState.entityType` via getEntityType()/entityFamily() at call
// time. This port has no global browser state, so that value is threaded
// through `O.entityType` instead (see types.ts) — same entityFamily()
// classifier, same branching logic, just sourced from the function argument.
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
import { entityFamily } from "@/lib/entities/entityFamily";
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

// ── For-Profit Corp: Articles of Incorporation ───────────────────────────────
export function buildArticlesCorp(O: OrgData) {
  const family = entityFamily(O.entityType);
  const isPC = family === "pc";
  const isSCorp = family === "scorp";
  const subtitle = isPC ? "Professional Corporation" : isSCorp ? "S-Corporation" : "For-Profit Corporation";
  return [
    ...coverBlock(O, "Articles of Incorporation", `${subtitle} · State of ${O.state}`),
    h1("Articles of Incorporation"),
    p(`State of ${O.state}`, { bold: true, color: "475569" }),
    blank(),
    h2("Article I — Name"),
    p(`The name of this corporation is ${O.name} (the "Corporation").`),
    isPC
      ? p(
          "This corporation is organized as a Professional Corporation under applicable state law. All shareholders must be licensed professionals in the field(s) practiced by the Corporation.",
          { italic: true, color: "475569" }
        )
      : blank(),
    blank(),
    h2("Article II — Purpose"),
    p(`The Corporation is organized for the purpose of engaging in any lawful act or activity for which corporations may be organized in the State of ${O.state}.`),
    O.mission ? p(`Primary Business Purpose: "${O.mission}"`, { italic: true }) : blank(),
    blank(),
    h2("Article III — Authorized Shares"),
    p("The total number of shares of stock the Corporation is authorized to issue is:"),
    p("10,000,000 shares of Common Stock, par value $0.0001 per share", { numbering: "bullets" }),
    p("1,000,000 shares of Preferred Stock, par value $0.0001 per share (undesignated — for future Board designation)", { numbering: "bullets" }),
    isSCorp
      ? p(
          "Note: S-Corp status requires no more than 100 shareholders, one class of stock, and no non-resident alien shareholders. These limits are enforced via the Shareholder Agreement.",
          { italic: true, color: "1B9AAA" }
        )
      : blank(),
    blank(),
    h2("Article IV — Principal Office"),
    p(`${O.address}, ${O.city}, ${O.state} ${O.zip}`),
    blank(),
    h2("Article V — Registered Agent"),
    p(`The Corporation shall maintain a registered agent in the State of ${O.state} with a physical street address as required by law.`),
    blank(),
    h2("Article VI — Board of Directors"),
    p("The initial Board of Directors shall consist of:"),
    ...O.board.map((m) => p(`${m.name} — ${m.role}`, { numbering: "bullets" })),
    p("The number of Directors may be changed by resolution of the Board or as specified in the Bylaws."),
    blank(),
    h2("Article VII — Limitation of Director Liability"),
    p(
      "To the fullest extent permitted by applicable law, a Director shall not be liable for monetary damages to the Corporation or its shareholders for breach of fiduciary duty as a Director, except for: (a) breach of the duty of loyalty; (b) acts or omissions not in good faith; (c) unlawful dividends or stock repurchases; (d) transactions from which the Director derived improper personal benefit."
    ),
    blank(),
    h2("Article VIII — Indemnification"),
    p("The Corporation shall indemnify each Director, officer, employee, and agent to the fullest extent permitted by applicable law."),
    blank(),
    h2("Article IX — Incorporator"),
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

// ── For-Profit Corp: Bylaws ───────────────────────────────────────────────────
export function buildBylawsCorp(O: OrgData) {
  const family = entityFamily(O.entityType);
  const isPC = family === "pc";
  const subtitle = isPC ? "Professional Corporation" : "Corporation";
  return [
    ...coverBlock(O, "Corporate Bylaws", `${subtitle} Governing Document`),
    h1(`Bylaws of ${O.name}`),
    p("Adopted: " + O.date, { color: "475569" }),
    blank(),
    h2("Article I — Offices"),
    p(`The principal office shall be at ${O.address}, ${O.city}, ${O.state} ${O.zip}.`),
    blank(),
    h2("Article II — Shareholders"),
    h3("Section 2.1 — Annual Meeting"),
    p("The annual meeting of shareholders shall be held on a date fixed by the Board."),
    h3("Section 2.2 — Special Meetings"),
    p("Special meetings may be called by the Board or shareholders holding at least 10% of voting shares."),
    h3("Section 2.3 — Quorum"),
    p("A majority of shares entitled to vote constitutes a quorum."),
    h3("Section 2.4 — Record Date"),
    p("The Board may fix a record date for determining shareholders entitled to vote, not more than 70 days before the meeting."),
    blank(),
    h2("Article III — Board of Directors"),
    h3("Section 3.1 — Powers"),
    p("The business and affairs of the Corporation shall be managed by the Board of Directors."),
    h3("Section 3.2 — Number"),
    p("The Board shall consist of no fewer than one (1) and no more than fifteen (15) Directors."),
    h3("Section 3.3 — Election"),
    p("Directors shall be elected annually by shareholders at the annual meeting."),
    h3("Section 3.4 — Term"),
    p("Each Director shall serve a one (1)-year term until the next annual meeting."),
    h3("Section 3.5 — Vacancies"),
    p("Vacancies may be filled by majority vote of the remaining Directors."),
    h3("Section 3.6 — Removal"),
    p("Any Director may be removed by shareholders holding a majority of voting shares."),
    h3("Section 3.7 — Compensation"),
    p("Directors shall be compensated as fixed by the Board from time to time."),
    blank(),
    h2("Article IV — Meetings of the Board"),
    h3("Section 4.1 — Regular Meetings"),
    p("The Board shall meet no fewer than four (4) times per year."),
    h3("Section 4.2 — Special Meetings"),
    p("Special meetings may be called by the Chairman, CEO, or any two Directors."),
    h3("Section 4.3 — Quorum"),
    p("A majority of the total number of Directors constitutes a quorum."),
    h3("Section 4.4 — Action Without Meeting"),
    p("The Board may act by unanimous written consent without a meeting."),
    blank(),
    h2("Article V — Officers"),
    h3("Section 5.1 — Officers"),
    p("Officers shall include a Chief Executive Officer (CEO), Secretary, and Chief Financial Officer (CFO). Additional officers may be appointed by the Board."),
    h3("Section 5.2 — CEO"),
    p("The CEO shall be the principal executive officer and shall have general supervision of the business."),
    h3("Section 5.3 — Secretary"),
    p("The Secretary shall maintain corporate records, minutes, and official correspondence."),
    h3("Section 5.4 — CFO"),
    p("The CFO shall maintain financial records, oversee accounting, and prepare financial reports."),
    h3("Section 5.5 — Removal"),
    p("Any officer may be removed by the Board at any time, with or without cause."),
    blank(),
    h2("Article VI — Stock"),
    h3("Section 6.1 — Issuance"),
    p("Shares shall be issued by authorization of the Board. Certificates shall be signed by the CEO and Secretary."),
    h3("Section 6.2 — Transfers"),
    p("Shares may be transferred only on the stock ledger of the Corporation."),
    h3("Section 6.3 — Record Date"),
    p("The Board may fix a record date for shareholder rights, not more than 70 days prior to the record date event."),
    blank(),
    h2("Article VII — Dividends"),
    p("Dividends may be declared by the Board out of funds legally available therefor, subject to applicable law."),
    blank(),
    h2("Article VIII — Fiscal Year"),
    p(`The fiscal year shall end on ${O.fiscal} of each year.`),
    blank(),
    h2("Article IX — Amendments"),
    p("These Bylaws may be amended by a majority vote of the Board or by shareholders holding a majority of voting shares."),
    blank(480),
    divider(),
    p("CERTIFICATION OF ADOPTION", { bold: true, align: "center", after: 240 }),
    p("Secretary: _______________________________     Date: ________________", { after: 120 }),
    p("CEO / President: _______________________________     Date: ________________"),
  ];
}

// ── Stock Ledger & Cap Table Template ────────────────────────────────────────
export function buildStockLedger(O: OrgData) {
  const headerRow = (cols: [string, number][], bg: string) =>
    new TableRow({
      children: cols.map(
        ([text, w]) =>
          new TableCell({
            width: { size: w, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            shading: { fill: bg, type: ShadingType.CLEAR },
            borders: bdr("E2E8F0"),
            children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })],
          })
      ),
    });
  const dataRow = (cols: [string, number][]) =>
    new TableRow({
      children: cols.map(
        ([text, w]) =>
          new TableCell({
            width: { size: w, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            borders: bdr("E2E8F0"),
            children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 18 })] })],
          })
      ),
    });
  const cols: [string, number][] = [
    ["Cert #", 700],
    ["Shareholder Name", 2200],
    ["Title", 1200],
    ["Shares Issued", 1200],
    ["Issue Date", 1200],
    ["Issue Price", 1100],
    ["Vested", 900],
    ["Notes", 1860],
  ];
  const totalW = cols.reduce((a, [, w]) => a + w, 0);
  const capTable = new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: cols.map(([, w]) => w),
    rows: [
      headerRow(cols, "0D1F3C"),
      ...O.board.map(
        (m, i) =>
          dataRow([
            [String(i + 1).padStart(3, "0"), 700],
            [m.name, 2200],
            [m.role, 1200],
            ["1,000,000", 1200],
            [O.date, 1200],
            ["$0.0001", 1100],
            ["0%", 900],
            ["4-yr vest, 1-yr cliff", 1860],
          ])
      ),
      dataRow([
        ["—", 700],
        ["[ESOP Pool]", 2200],
        ["Reserved", 1200],
        ["2,000,000", 1200],
        ["—", 1200],
        ["—", 1100],
        ["—", 900],
        ["Option pool", 1860],
      ]),
    ],
  });
  return [
    ...coverBlock(O, "Stock Ledger & Cap Table", "Equity Tracking Document"),
    h1(`Stock Ledger — ${O.name}`),
    p("As of: " + O.date, { color: "475569" }),
    blank(),
    p(
      "IMPORTANT: This is a template. Update with actual share counts, prices, and vesting schedules as agreed by the founders. All equity grants should be authorized by Board resolution.",
      { bold: true, italic: true, color: "1B9AAA", after: 240 }
    ),
    h2("Authorized Shares Summary"),
    p("Common Stock authorized: 10,000,000 shares | Preferred Stock authorized: 1,000,000 shares (undesignated)", { bold: true }),
    blank(),
    h2("Capitalization Table"),
    capTable,
    blank(240),
    h2("Stock Certificate Register"),
    p("All certificates must be recorded below as issued. Maintain this ledger as the official corporate record."),
    blank(),
    p("Total Shares Issued (Common): ___________________________", { after: 120 }),
    p("Total Shares Outstanding (Common): ___________________________", { after: 120 }),
    p("Options / Warrants Outstanding: ___________________________", { after: 120 }),
    p("Fully Diluted Share Count: ___________________________"),
    blank(480),
    divider(),
    p("Secretary: _______________________________     Date: ________________"),
  ];
}

// ── Founder Stock Purchase Agreement ─────────────────────────────────────────
export function buildFounderStock(O: OrgData) {
  const founders = O.board && O.board.length > 0 ? O.board : [{ name: O.contact, role: "Founder" }];
  return [
    ...coverBlock(O, "Founder Stock Purchase Agreement", "Restricted Stock · 4-Year Vesting"),
    h1("Founder Stock Purchase Agreement"),
    p('This Agreement is entered into as of ' + O.date + " between " + O.name + ' (the "Company") and the Founder named below.', { after: 240 }),
    blank(),
    h2("1. Purchase and Sale of Shares"),
    p(
      'Subject to the terms below, the Company hereby sells to Founder, and Founder hereby purchases from the Company, the number of shares set forth on the signature page ("Shares") at the purchase price per share indicated.'
    ),
    blank(),
    h2("2. Vesting Schedule"),
    h3("2.1 Standard 4-Year / 1-Year Cliff"),
    p('25% of Shares vest on the one-year anniversary of the Vesting Commencement Date ("Cliff"). The remaining 75% vest in equal monthly installments over the following 36 months.'),
    h3("2.2 Acceleration"),
    p('In the event of a Change of Control, 100% of unvested Shares shall fully accelerate ("single trigger") unless otherwise agreed in writing.'),
    blank(),
    h2("3. Repurchase Option"),
    p(
      'The Company shall have an irrevocable option to repurchase all unvested Shares at cost upon termination of the Founder\'s service relationship with the Company ("Repurchase Option"). The Repurchase Option shall lapse pro-rata as Shares vest.'
    ),
    blank(),
    h2("4. 83(b) Election"),
    p(
      "IMPORTANT: Founder should consult a tax advisor regarding filing an 83(b) election with the IRS within 30 days of purchase. Failure to timely file an 83(b) election may result in ordinary income tax on the difference between the fair market value and purchase price at each vesting date.",
      { bold: true, color: "1B9AAA" }
    ),
    blank(),
    h2("5. Restrictions on Transfer"),
    p(
      "Shares may not be sold, transferred, pledged, or otherwise disposed of without the prior written consent of the Company, except (i) to family members for estate planning and (ii) as otherwise permitted in the Company's charter documents."
    ),
    blank(),
    h2("6. Right of First Refusal"),
    p(
      "Prior to any proposed transfer of Shares, Founder shall give the Company written notice. The Company shall have the right to purchase such Shares at the proposed transfer price within 30 days of receipt of notice."
    ),
    blank(),
    ...founders
      .map((f, i) => [
        h2(`Founder ${i + 1} — Signature Page`),
        p(`Founder Name: ${f.name}     Title: ${f.role}`, { bold: true, after: 160 }),
        p("Number of Shares Purchased: _______________________________", { after: 120 }),
        p("Purchase Price per Share: $_______ Total Purchase Price: $_______", { after: 120 }),
        p("Vesting Commencement Date: _______________________________", { after: 240 }),
        p("Signature: _______________________________     Date: ________________", { after: 120 }),
        blank(),
      ])
      .flat(),
    divider(),
    p("Accepted by the Company:", { bold: true, after: 160 }),
    p(`${O.name}`, { bold: true }),
    p("By: _______________________________     Title: _______________________________", { after: 120 }),
    p("Date: ________________"),
  ];
}

// ── 83(b) Election Guide ──────────────────────────────────────────────────────
export function build83bGuide(O: OrgData) {
  const infoTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3200, 6160],
    rows: [
      ["Your Name", O.contact],
      ["Social Security Number", "(Enter your SSN — do not send to FormRight)"],
      ["Address", O.address + ", " + O.city + ", " + O.state + " " + O.zip],
      ["Description of Property", "Shares of " + O.name + " Common Stock"],
      ["Date Property Transferred", O.date],
      ["Taxable Year for Which Election Is Made", String(O.year)],
      ["Nature of Restriction", "4-year vesting schedule with 1-year cliff and company repurchase option on unvested shares"],
      ["FMV at Time of Transfer", "$______ per share (obtain valuation or use purchase price if arms-length)"],
      ["Amount Paid for Property", "$______ per share (your cost basis)"],
      ["Amount to Include in Income", "FMV minus amount paid per share (often $0 if purchased at FMV)"],
    ].map(
      ([l, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3200, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              shading: { fill: "E6F7F9", type: ShadingType.CLEAR },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: l, font: "Arial", size: 20, bold: true })] })],
            }),
            new TableCell({
              width: { size: 6160, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: v, font: "Arial", size: 20 })] })],
            }),
          ],
        })
    ),
  });
  return [
    ...coverBlock(O, "83(b) Election Guide", "IRS Section 83(b) — File Within 30 Days of Stock Purchase"),
    h1("83(b) Election Filing Guide"),
    p("Prepared for: " + O.name + " | " + O.date, { color: "475569" }),
    blank(),
    p(
      "⚠️  CRITICAL DEADLINE: You must file your 83(b) election within 30 days of your stock purchase date. Missing this deadline is irrevocable and can result in significant tax consequences.",
      { bold: true, color: "dc2626", after: 320 }
    ),
    h2("What Is an 83(b) Election?"),
    p(
      "Under IRC Section 83, when you receive property subject to a vesting schedule (including founder stock), you normally pay taxes on the value you receive at each vesting event. An 83(b) election allows you to elect to pay taxes on the entire grant now, based on the current (presumably low) fair market value, rather than at each future vesting date."
    ),
    blank(),
    h2("Why File an 83(b) Election?"),
    p("If you file an 83(b) election at purchase (when the stock may have little or no value):", { bold: true }),
    p("Your income at grant is $0 (or very small)", { numbering: "bullets" }),
    p("Future appreciation is taxed at long-term capital gains rates (not ordinary income)", { numbering: "bullets" }),
    p("Your capital gains holding period starts on the purchase date", { numbering: "bullets" }),
    blank(),
    p("If you do NOT file an 83(b) election:", { bold: true }),
    p("At each vesting date, you recognize ordinary income equal to the FMV of shares vesting minus your cost", { numbering: "bullets" }),
    p("By IPO or acquisition, this could result in millions of dollars of ordinary income tax", { numbering: "bullets" }),
    blank(),
    h2("How to File — Step by Step"),
    p("Step 1:", { bold: true, after: 40 }),
    p("Complete the 83(b) election statement below with your information."),
    p("Step 2:", { bold: true, after: 40 }),
    p("Sign and date two copies of the election."),
    p("Step 3:", { bold: true, after: 40 }),
    p("Mail one copy to the IRS service center where you file your tax return via certified mail, return receipt requested, within 30 days of the stock purchase date."),
    p("Step 4:", { bold: true, after: 40 }),
    p("Retain the signed copy and the certified mail receipt for your records."),
    p("Step 5:", { bold: true, after: 40 }),
    p("Attach a copy of the election to your income tax return for the year of transfer."),
    blank(),
    h2("Your 83(b) Election Statement — Pre-Filled Information"),
    infoTable,
    blank(240),
    h2("83(b) Election Template"),
    p("(Complete with your information and file with the IRS)"),
    blank(),
    p(
      "The undersigned taxpayer hereby elects, pursuant to IRC Section 83(b), to include in gross income the excess (if any) of the fair market value of the property described below over the amount paid for such property.",
      { italic: true, after: 160 }
    ),
    p("Taxpayer Name: _______________________________     SSN: ___-__-____", { after: 120 }),
    p("Property Description: " + O.board.length + " shares of Common Stock of " + O.name, { after: 120 }),
    p("Date Transferred: " + O.date, { after: 120 }),
    p("FMV at Transfer: $_____ per share     Amount Paid: $_____ per share     Taxable Amount: $_____ per share", { after: 240 }),
    p("Taxpayer Signature: _______________________________     Date: ________________"),
  ];
}

// ── IRS Form 2553 — S-Corp Election Guide ─────────────────────────────────────
export function buildForm2553(O: OrgData) {
  const infoTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3400, 5960],
    rows: [
      ["Line A — Corporation Name", O.name],
      ["Line B — EIN", O.ein || "Obtain before filing"],
      ["Line C — Address", O.address + ", " + O.city + ", " + O.state + " " + O.zip],
      ["Line D — Incorporation Date", O.date],
      ["Line E — State of Incorporation", O.state],
      ["Line F — Election Effective Date", "First tax year beginning _________ (enter desired date)"],
      ["Line G — Tax Year End", O.fiscal ? O.fiscal.split(" ")[0] + "/" + (O.fiscal.includes("31") ? "31" : "30") : "12/31"],
      ["Line H — Accounting Method", "☐ Cash   ☐ Accrual   ☐ Other"],
      ["Contact Person", O.contact + " | " + O.email],
    ].map(
      ([l, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3400, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              shading: { fill: "E6F7F9", type: ShadingType.CLEAR },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: l, font: "Arial", size: 20, bold: true })] })],
            }),
            new TableCell({
              width: { size: 5960, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              borders: bdr("E2E8F0"),
              children: [new Paragraph({ children: [new TextRun({ text: v, font: "Arial", size: 20 })] })],
            }),
          ],
        })
    ),
  });
  return [
    ...coverBlock(O, "IRS Form 2553 Guide", "S-Corporation Election — File Timely"),
    h1("S-Corporation Election Guide — IRS Form 2553"),
    p("Prepared for: " + O.name + " | " + O.date, { color: "475569" }),
    blank(),
    p(
      "FILING DEADLINE: To be effective for the current tax year, Form 2553 must be filed no later than 2 months and 15 days after the beginning of the first tax year. For a new corporation, this is 2 months and 15 days after incorporation.",
      { bold: true, color: "1B9AAA", after: 240 }
    ),
    h2("S-Corporation Eligibility Requirements"),
    p("Before electing S-Corp status, confirm ALL of the following:", { bold: true }),
    p("The corporation must be a domestic corporation organized in a U.S. state", { numbering: "bullets" }),
    p("No more than 100 shareholders", { numbering: "bullets" }),
    p("All shareholders must be U.S. citizens or permanent residents (no non-resident alien shareholders)", { numbering: "bullets" }),
    p("Only one class of stock (though voting vs. non-voting is permitted)", { numbering: "bullets" }),
    p("No ineligible shareholders (corporations, partnerships, or most LLCs — exceptions apply for single-member LLCs)", { numbering: "bullets" }),
    p("Not an ineligible corporation (certain financial institutions, insurance companies, domestic international sales corporations)", { numbering: "bullets" }),
    blank(),
    h2("Your Pre-Filled Form 2553 Information"),
    infoTable,
    blank(240),
    h2("Shareholder Consent — All Shareholders Must Sign"),
    p("Each person who was a shareholder at any time during the period before the election is effective must sign Form 2553 (or a separate consent statement)."),
    blank(),
    ...O.board.map((m) => p(`${m.name} (${m.role}): Signature _____________________ Date ___________`, { after: 120 })),
    blank(),
    h2("How to File"),
    p("Step 1:", { bold: true, after: 40 }),
    p("Download Form 2553 from IRS.gov."),
    p("Step 2:", { bold: true, after: 40 }),
    p("Complete all fields using the information above."),
    p("Step 3:", { bold: true, after: 40 }),
    p("Obtain signatures from ALL shareholders."),
    p("Step 4:", { bold: true, after: 40 }),
    p("Mail to the appropriate IRS Service Center (see Form 2553 instructions for your state)."),
    p("Step 5:", { bold: true, after: 40 }),
    p("Keep a copy. The IRS will send you a CP261 notice confirming your S-Corp election."),
    blank(),
    h2("Key Tax Implications"),
    p("Reasonable salary requirement:", { bold: true, after: 40 }),
    p("S-Corp shareholders who are also employees must pay themselves a reasonable salary subject to payroll taxes. The IRS will audit S-Corps that pay no salary to shareholder-employees."),
    p("Distributions:", { bold: true, after: 40 }),
    p("Distributions to shareholders are not subject to self-employment tax, which is the primary tax advantage of the S-Corp election."),
    p("Basis tracking:", { bold: true, after: 40 }),
    p("Maintain records of your stock basis and debt basis each year. Losses are limited to your basis."),
    blank(),
    p("Questions? Contact FormRight at support@formright.org or consult a CPA.", { italic: true, color: "475569", align: "center" }),
  ];
}

// ── Corporate Meeting Minutes (For-Profit / LLC) ──────────────────────────────
export function buildMinutesCorp(O: OrgData) {
  const isLLC = entityFamily(O.entityType) === "llc";
  const bodyType = isLLC ? "Members" : "Board of Directors";
  const meetingType = isLLC ? "Organizational Meeting of the Members" : "Organizational Meeting of the Board of Directors";
  return [
    ...coverBlock(O, `Initial ${bodyType} Meeting Minutes`, "Organizational Meeting Documentation"),
    h1(`Minutes of the ${meetingType}`),
    p(O.name, { bold: true }),
    blank(),
    p(`Date: ${O.date}`, { after: 80 }),
    p("Time: ___:___ AM / PM", { after: 80 }),
    p(`Location: ${O.address}, ${O.city}, ${O.state}`, { after: 80 }),
    p(`Presiding: ${O.board[0]?.name || O.contact}`),
    blank(),
    h2(`I. ${isLLC ? "Members" : "Directors"} Present`),
    ...O.board.map((m) => p(`${m.name} — ${m.role}`, { numbering: "bullets" })),
    blank(),
    p(`A quorum of ${isLLC ? "members" : "directors"} being present, the meeting was called to order.`),
    blank(),
    h2(`II. ${isLLC ? "Articles of Organization" : "Articles of Incorporation"}`),
    p(
      `RESOLVED, that the ${isLLC ? "Articles of Organization" : "Articles of Incorporation"} of ${O.name} filed with the Secretary of State of ${O.state} are hereby ratified and approved.`,
      { italic: true }
    ),
    blank(),
    h2(`III. ${isLLC ? "Operating Agreement" : "Bylaws"}`),
    p(`RESOLVED, that the ${isLLC ? "Operating Agreement" : "Bylaws"} presented at this meeting are hereby adopted as the governing document of ${O.name}.`, {
      italic: true,
    }),
    blank(),
    h2(`IV. ${isLLC ? "Officers / Managing Member(s)" : "Election of Officers"}`),
    ...O.board.map((m) => p(`RESOLVED, that ${m.name} is hereby designated as ${m.role}.`, { italic: true, after: 80 })),
    blank(),
    h2("V. Authorization to Open Bank Account"),
    p(
      `RESOLVED, that the Corporation is hereby authorized to open a business checking account at [BANK NAME], and that the following individuals are authorized as signatories on such account: ${O.board
        .map((m) => m.name)
        .join(", ")}.`,
      { italic: true }
    ),
    blank(),
    h2("VI. Authorization to Obtain EIN"),
    p(
      `RESOLVED, that the ${isLLC ? "Managing Member" : "Secretary or CFO"} is authorized to apply for an Employer Identification Number (EIN) from the IRS on behalf of ${O.name}.`,
      { italic: true }
    ),
    blank(),
    isLLC ? blank() : h2("VII. Initial Stock Issuance"),
    isLLC
      ? blank()
      : p(
          `RESOLVED, that the Corporation is authorized to issue shares of Common Stock to the founders as follows, at a price per share to be determined by the Board, subject to execution of a Founder Stock Purchase Agreement and, if applicable, an 83(b) election.`,
          { italic: true }
        ),
    blank(),
    h2(`${isLLC ? "VII" : "VIII"}. Fiscal Year`),
    p(`RESOLVED, that the fiscal year of ${O.name} shall end on ${O.fiscal} of each year.`, { italic: true }),
    blank(),
    h2(`${isLLC ? "VIII" : "IX"}. Adjournment`),
    p("There being no further business, the meeting was duly adjourned."),
    blank(480),
    divider(),
    p(`${isLLC ? "Secretary / Managing Member" : "Secretary"}: _______________________________     Date: ________________`),
  ];
}

// ── Resolution Templates, shared by LLC + for-profit corp families ──────────
// Previously this document key fell through to nonprofit.ts's buildResolutions()
// for every entity type, including two resolutions (Executive Director
// appointment, grant-application authorization) that are meaningless outside
// a nonprofit. Split out here with the same isLLC branching buildMinutesCorp()
// already established, so LLCs get member/operating-agreement/membership-interest
// language and corporations get director/bylaws/stock language instead of
// nonprofit board language.
export function buildResolutionsCorp(O: OrgData) {
  const isLLC = entityFamily(O.entityType) === "llc";
  const entityLabel = isLLC ? "Company" : "Corporation";
  const bodyLabel = isLLC ? "Members" : "Board of Directors";
  const signerLabel = isLLC ? "Managing Member" : "Secretary";
  const govDocLabel = isLLC ? "Operating Agreement" : "Bylaws";
  const docTitle = isLLC ? "Member Resolution Templates" : "Board Resolution Templates";

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

  const signatureLine = () => p(`${signerLabel}: _______________________________     Date: ________________`);

  return [
    ...coverBlock(O, docTitle, `Standard Resolutions for ${entityLabel} Governance Actions`),
    h1(docTitle),
    p("Complete the bracketed fields and record the vote in meeting minutes.", { italic: true, color: "475569" }),
    blank(),

    h2("Resolution 1 — Authorization of Bank Account"),
    metaTable(),
    blank(160),
    p(
      `RESOLVED, that the ${entityLabel} is authorized to open and maintain a bank account at [BANK NAME], and the following individuals are authorized as signatories:`,
      { italic: true }
    ),
    blank(80),
    p("Authorized Signatory 1: _______________________________  Title: _______________", { after: 100 }),
    p("Authorized Signatory 2: _______________________________  Title: _______________"),
    blank(240),
    signatureLine(),
    blank(),
    divider(),
    blank(),

    h2("Resolution 2 — Approval of Annual Budget"),
    p(
      `RESOLVED, that the ${bodyLabel} of ${O.name} approves the operating budget for fiscal year ending [DATE], in the total amount of $[AMOUNT], attached as Exhibit A.`,
      { italic: true }
    ),
    blank(240),
    signatureLine(),
    blank(),
    divider(),
    blank(),

    h2(isLLC ? "Resolution 3 — Appointment of Officers / Managers" : "Resolution 3 — Appointment of Officers"),
    p(
      `RESOLVED, that the ${bodyLabel} hereby appoints the following ${isLLC ? "officers/managers" : "officers"} of the ${entityLabel}, each to serve until removed or replaced:`,
      { italic: true }
    ),
    blank(80),
    ...(O.board.length > 0
      ? O.board.map((m) => p(`${m.name} — ${m.role}`, { numbering: "bullets", after: 60 }))
      : [p("[NAME] — [TITLE]", { numbering: "bullets" })]),
    blank(240),
    signatureLine(),
    blank(),
    divider(),
    blank(),

    h2(isLLC ? "Resolution 4 — Authorization to Issue Membership Interests" : "Resolution 4 — Authorization of Founder Stock Issuance"),
    p(
      isLLC
        ? `RESOLVED, that the Company is authorized to issue membership interests to the following Members in the percentages set forth below, subject to the terms of the Operating Agreement:`
        : `RESOLVED, that the Corporation is authorized to issue an aggregate of [NUMBER] shares of Common Stock to the following founders in consideration of cash, services rendered, and/or assignment of intellectual property, subject to execution of a Founder Stock Purchase Agreement and, where applicable, a vesting schedule set forth therein:`,
      { italic: true }
    ),
    blank(80),
    ...(O.board.length > 0
      ? O.board.map((m) => p(`${m.name} — ${isLLC ? "[__]% membership interest" : "[NUMBER] shares"}`, { numbering: "bullets", after: 60 }))
      : [p(isLLC ? "[NAME] — [__]% membership interest" : "[NAME] — [NUMBER] shares", { numbering: "bullets" })]),
    blank(240),
    signatureLine(),
    blank(),
    divider(),
    blank(),

    h2(`Resolution 5 — Amendment of ${govDocLabel}`),
    p(`RESOLVED, that the ${govDocLabel} of ${O.name} are hereby amended as follows:`, { italic: true }),
    blank(80),
    p("[DESCRIBE AMENDMENT HERE]", { color: "1B9AAA", italic: true }),
    blank(80),
    p(
      `Note: ${govDocLabel} amendments require ${isLLC ? "unanimous written consent of all Members, unless the Operating Agreement specifies a lower threshold" : "a two-thirds (2/3) vote of the full Board"}.`,
      { bold: true, color: "475569" }
    ),
    blank(240),
    signatureLine(),
    blank(),
    divider(),
    blank(),

    h2("Resolution 6 — Written Consent in Lieu of Meeting"),
    p(
      `The undersigned, being all of the ${bodyLabel}, hereby consent to and adopt the following resolution without a meeting:`,
      { italic: true }
    ),
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
