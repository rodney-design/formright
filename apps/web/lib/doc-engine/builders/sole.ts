// Sole Proprietorship / DBA document builders.
//
// Ported verbatim from formright_v2_pbc.html (second FORMRIGHT script block):
// buildDBAGuide, buildLicenseChecklist.
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
import { blank, coverBlock, h1, h2, h3, p } from "../helpers";
import type { OrgData } from "../types";

function bdr(c: string) {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: c },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: c },
    left: { style: BorderStyle.SINGLE, size: 1, color: c },
    right: { style: BorderStyle.SINGLE, size: 1, color: c },
  };
}

// ── Sole Proprietorship / DBA Registration Guide ─────────────────────────────
export function buildDBAGuide(O: OrgData) {
  const infoTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3400, 5960],
    rows: [
      ["Owner Legal Name", O.contact],
      ["Business Trade Name (DBA)", O.name],
      ["Principal Business Address", O.address + ", " + O.city + ", " + O.state + " " + O.zip],
      ["Business Description", O.mission || "[Describe your business activity]"],
      ["County / Parish", "[Enter your county — DBA is filed at county level in most states]"],
      ["State of Operation", O.state],
      ["Date Business Commenced", O.date],
      ["Owner Email", O.email],
    ].map(
      ([l, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3400, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              shading: { fill: "FFF7ED", type: ShadingType.CLEAR },
              borders: bdr("FED7AA"),
              children: [new Paragraph({ children: [new TextRun({ text: l, font: "Arial", size: 20, bold: true, color: "9A3412" })] })],
            }),
            new TableCell({
              width: { size: 5960, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              borders: bdr("FED7AA"),
              children: [new Paragraph({ children: [new TextRun({ text: v, font: "Arial", size: 20 })] })],
            }),
          ],
        })
    ),
  });
  return [
    ...coverBlock(O, "DBA Registration Guide", `Doing Business As · State of ${O.state}`),
    h1("DBA (Fictitious Business Name) Registration Guide"),
    p("Prepared for: " + O.name + " | " + O.date, { color: "475569" }),
    blank(),
    p(
      'A DBA ("Doing Business As" or "Fictitious Business Name") allows you to operate under a trade name different from your legal name. It does not create a separate legal entity — you remain personally liable as a sole proprietor.',
      { italic: true, color: "475569", after: 240 }
    ),
    h2("What You'll Need to File"),
    p("Owner's full legal name and address", { numbering: "bullets" }),
    p("Business trade name (exactly as you want it registered)", { numbering: "bullets" }),
    p("Business address and county", { numbering: "bullets" }),
    p("Description of business activity", { numbering: "bullets" }),
    p("Filing fee (typically $10–$100 depending on state and county)", { numbering: "bullets" }),
    blank(),
    h2("Your Pre-Filled DBA Information"),
    infoTable,
    blank(240),
    h2("State-Specific Filing Instructions"),
    h3("Where to File"),
    p("Most states require DBA registration at the county clerk's office in the county where you operate. Some states (e.g., California, Texas) also require newspaper publication."),
    blank(),
    h3("Common State Requirements"),
    p("California: File with county clerk + publish in local newspaper for 4 consecutive weeks. Cost: ~$26 county fee + publication fees.", { numbering: "bullets" }),
    p("Texas: File with county clerk. Some counties also require newspaper publication. Cost: ~$15–$25.", { numbering: "bullets" }),
    p("New York: File with county clerk + publish in two newspapers for 6 consecutive weeks. Cost: $100–$1,400+ due to publication costs.", { numbering: "bullets" }),
    p("Florida: File with county clerk. No publication required. Cost: ~$50.", { numbering: "bullets" }),
    p("Delaware: File with the county or municipality. Cost: varies.", { numbering: "bullets" }),
    p("All other states: Check your Secretary of State or county clerk website for current requirements.", { numbering: "bullets" }),
    blank(),
    h2("After Filing Your DBA"),
    p("Open a business bank account in your trade name", { numbering: "bullets" }),
    p("Obtain any required local business licenses and permits", { numbering: "bullets" }),
    p("Apply for an EIN (optional but recommended for banking and taxes)", { numbering: "bullets" }),
    p("Renew your DBA as required (typically every 2–5 years)", { numbering: "bullets" }),
    p("Consider upgrading to an LLC for liability protection as your business grows", { numbering: "bullets" }),
    blank(),
    h2("Sole Proprietor vs. LLC — Key Differences"),
    p("Sole Proprietorship: Simple, low cost, no state filing required. You are the business — full personal liability for all business debts and legal claims.", { numbering: "bullets" }),
    p("LLC: Modest state filing fee ($50–$200). Separate legal entity. Personal assets protected from business debts (with proper operation). Recommended once revenue begins.", {
      numbering: "bullets",
    }),
    blank(),
    p("FormRight offers a discounted LLC upgrade path. Contact support@formright.org for details.", { italic: true, color: "475569", align: "center" }),
  ];
}

// ── Local Business License Checklist ─────────────────────────────────────────
export function buildLicenseChecklist(O: OrgData) {
  const checkRow = (item: string, note: string) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 600, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          borders: bdr("E2E8F0"),
          children: [new Paragraph({ children: [new TextRun({ text: "☐", font: "Arial", size: 22 })] })],
        }),
        new TableCell({
          width: { size: 5000, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          borders: bdr("E2E8F0"),
          children: [new Paragraph({ children: [new TextRun({ text: item, font: "Arial", size: 20, bold: true })] })],
        }),
        new TableCell({
          width: { size: 3760, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          borders: bdr("E2E8F0"),
          children: [new Paragraph({ children: [new TextRun({ text: note, font: "Arial", size: 18, color: "475569" })] })],
        }),
      ],
    });
  const headerRow2 = (cols: [string, number][]) =>
    new TableRow({
      children: cols.map(
        ([text, w]) =>
          new TableCell({
            width: { size: w, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            shading: { fill: "0D1F3C", type: ShadingType.CLEAR },
            borders: bdr("0D1F3C"),
            children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })],
          })
      ),
    });
  const licenseTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [600, 5000, 3760],
    rows: [
      headerRow2([
        ["☑", 600],
        ["License / Permit / Registration", 5000],
        ["Notes & Where to File", 3760],
      ]),
      checkRow("DBA / Fictitious Business Name", "County Clerk — required to use trade name"),
      checkRow("General Business License", "City/County — most jurisdictions require this"),
      checkRow("Seller's Permit (if selling goods)", "State Board of Equalization / Dept of Revenue"),
      checkRow("Home Occupation Permit", "City/County — if operating from home"),
      checkRow("Professional License", "State Licensing Board — industry-specific"),
      checkRow("Federal Contractor Registration", "SAM.gov — if contracting with federal government"),
      checkRow("Food Handler's Permit", "County Health Dept — food businesses only"),
      checkRow("Zoning / Land Use Permit", "City/County Planning Dept — commercial locations"),
      checkRow("Sign Permit", "City/County — exterior business signage"),
      checkRow("Fire Safety Permit / Inspection", "Local Fire Marshal — public-facing businesses"),
      checkRow("EIN (Employer Identification Number)", "IRS.gov — free, instant online"),
      checkRow("Business Bank Account", "Bank — requires EIN and DBA certificate"),
      checkRow("Business Insurance", "Insurance provider — GL, professional liability, etc."),
      checkRow("Sales Tax Registration", "State Revenue Dept — if selling taxable goods/services"),
      checkRow("Quarterly Estimated Tax Payments", "IRS Form 1040-ES — due Q1/Q2/Q3/Q4"),
    ],
  });
  return [
    ...coverBlock(O, "Business License Checklist", `Sole Proprietorship / DBA · State of ${O.state}`),
    h1("Local Business License & Permit Checklist"),
    p(O.name + " | State: " + O.state + " | " + O.date, { color: "475569" }),
    blank(),
    p(
      "Every business needs to comply with federal, state, and local licensing requirements. This checklist covers the most common requirements for sole proprietors and DBAs. Not all items will apply — check off what is relevant to your business type and location.",
      { italic: true, color: "475569", after: 240 }
    ),
    licenseTable,
    blank(240),
    h2("State-Specific Resources"),
    p(O.state + " Secretary of State (business search, DBA filing): sos." + O.state.toLowerCase().replace(/ /g, "") + ".gov", { numbering: "bullets" }),
    p(O.state + " Dept of Revenue (sales tax, seller's permit): Check state revenue website", { numbering: "bullets" }),
    p("U.S. SBA Business License Search: sba.gov/business-guide/launch-your-business/apply-licenses-permits", { numbering: "bullets" }),
    p("IRS EIN Application (free, instant): irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online", {
      numbering: "bullets",
    }),
    blank(),
    h2("Important Dates to Track"),
    p("DBA Renewal: Most DBAs must be renewed every ____ years. Note renewal date: _____________", { after: 80 }),
    p("Business License Renewal: Annual renewal date: _____________", { after: 80 }),
    p("Quarterly Estimated Taxes: Apr 15 · Jun 15 · Sep 15 · Jan 15", { after: 80 }),
    p("Annual Tax Return (Schedule C): April 15 of following year"),
    blank(),
    p("Need help upgrading to an LLC? FormRight offers a credit toward LLC formation for sole proprietors ready to grow. Contact support@formright.org.", {
      italic: true,
      color: "F97316",
      align: "center",
    }),
  ];
}
