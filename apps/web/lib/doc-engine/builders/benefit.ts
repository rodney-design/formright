// Benefit Corporation document builders.
//
// Ported verbatim from formright_v2_pbc.html (second FORMRIGHT script block):
// buildArticlesBenefit, buildBenefitReport.
import { blank, coverBlock, divider, h1, h2, h3, p } from "../helpers";
import type { OrgData } from "../types";

// ── Benefit Corp: Articles of Incorporation ───────────────────────────────────
export function buildArticlesBenefit(O: OrgData) {
  return [
    ...coverBlock(O, "Articles of Incorporation", `Benefit Corporation · State of ${O.state}`),
    h1("Articles of Incorporation"),
    p(`Benefit Corporation · State of ${O.state}`, { bold: true, color: "475569" }),
    blank(),
    h2("Article I — Name"),
    p(`The name of this corporation is ${O.name} (the "Corporation").`),
    blank(),
    h2("Article II — Benefit Corporation Status"),
    p(
      `This Corporation is organized as a Benefit Corporation under the laws of the State of ${O.state} and shall be subject to the requirements and obligations of the applicable Benefit Corporation statute.`
    ),
    blank(),
    h2("Article III — General and Specific Public Benefit Purposes"),
    h3("General Public Benefit"),
    p(
      "The Corporation shall have as one of its purposes the creation of general public benefit, defined as a material positive impact on society and the environment, taken as a whole, assessed against a third-party standard, from the business and operations of the Corporation."
    ),
    h3("Specific Public Benefit Purpose(s)"),
    p(
      O.mission
        ? O.mission
        : '[Describe your specific public benefit purpose here — e.g., "to provide sustainable employment in underserved communities" or "to reduce carbon emissions through renewable energy solutions."]',
      { italic: true, color: "0EA5E9", after: 240 }
    ),
    p("This specific benefit purpose shall be stated in all marketing materials, annual reports, and filings required by the applicable Benefit Corporation statute.", {
      italic: true,
      color: "475569",
    }),
    blank(),
    h2("Article IV — Business Purposes"),
    p(`Subject to its benefit corporation obligations, the Corporation may engage in any lawful act or activity for which corporations may be organized in the State of ${O.state}.`),
    blank(),
    h2("Article V — Authorized Shares"),
    p("10,000,000 shares of Common Stock, par value $0.0001 per share", { numbering: "bullets" }),
    p("1,000,000 shares of Preferred Stock, undesignated, par value $0.0001 per share", { numbering: "bullets" }),
    blank(),
    h2("Article VI — Principal Office"),
    p(`${O.address}, ${O.city}, ${O.state} ${O.zip}`),
    blank(),
    h2("Article VII — Registered Agent"),
    p(`The Corporation shall maintain a registered agent in the State of ${O.state}.`),
    blank(),
    h2("Article VIII — Directors and Benefit Director"),
    p("The Board shall manage the business of the Corporation in a manner that considers the interests of shareholders, employees, customers, the community, and the environment."),
    p("Initial Directors:"),
    ...O.board.map((m) => p(`${m.name} — ${m.role}`, { numbering: "bullets" })),
    blank(),
    h2("Article IX — Benefit Officer"),
    p("The Corporation shall designate a Benefit Officer (or assign those duties to an officer) responsible for preparing the Annual Benefit Report and overseeing compliance with the benefit corporation statute."),
    blank(),
    h2("Article X — Annual Benefit Report"),
    p(
      `The Corporation shall prepare an Annual Benefit Report assessing overall performance against a third-party standard, a description of activities pursued and impact achieved, compensation of directors, and a statement of any circumstances that have hindered the creation of public benefit. This report shall be posted publicly on the Corporation's website.`
    ),
    blank(),
    h2("Article XI — Incorporator"),
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

// ── Benefit Corp: Annual Benefit Report Template ──────────────────────────────
export function buildBenefitReport(O: OrgData) {
  return [
    ...coverBlock(O, "Annual Benefit Report", `Benefit Corporation · ${O.year || new Date().getFullYear()}`),
    h1(`Annual Benefit Report`),
    p(`${O.name} | Reporting Year: ${O.year || new Date().getFullYear()}`, { color: "475569" }),
    blank(),
    p(
      "This Annual Benefit Report is prepared pursuant to the Benefit Corporation statute of the State of " +
        O.state +
        " and describes the general and specific public benefit purposes pursued and the extent to which they were achieved.",
      { italic: true, color: "475569", after: 240 }
    ),
    h2("I. Our Specific Public Benefit Purpose"),
    p(O.mission || "[Restate your specific public benefit purpose from your Articles of Incorporation here.]", { italic: true, color: "0EA5E9" }),
    blank(),
    h2("II. Overall Assessment Against Third-Party Standard"),
    p("Third-Party Standard Used: ☐ B Lab (B Impact Assessment)  ☐ GRI  ☐ IRIS+  ☐ Other: _____________"),
    p("Overall Score / Performance Level: _______________________________", { after: 120 }),
    p("Compared to Prior Year: ☐ Improved  ☐ Same  ☐ Declined", { after: 120 }),
    p("Third-Party Certification Obtained: ☐ Yes — B Corp Certified  ☐ Pending  ☐ No"),
    blank(),
    h2("III. Activities Pursued to Create Public Benefit"),
    h3("Program / Activity 1"),
    p("Name: _______________________________", { after: 80 }),
    p("Description: _______________________________________________________________", { after: 80 }),
    p("Persons/Communities Served: _______________________________", { after: 80 }),
    p("Measurable Impact Achieved: _______________________________"),
    blank(),
    h3("Program / Activity 2"),
    p("Name: _______________________________", { after: 80 }),
    p("Description: _______________________________________________________________", { after: 80 }),
    p("Persons/Communities Served: _______________________________", { after: 80 }),
    p("Measurable Impact Achieved: _______________________________"),
    blank(),
    h2("IV. Environmental Performance"),
    p("Energy use change (year over year): ☐ Reduced ___% ☐ Same ☐ Increased", { after: 80 }),
    p("Carbon footprint: _______ metric tons CO₂e  |  Offset: _______ metric tons", { after: 80 }),
    p("Waste reduction initiatives: _______________________________", { after: 80 }),
    p("Environmental certifications: _______________________________"),
    blank(),
    h2("V. Worker and Community Impact"),
    p("Full-time equivalent employees: _______  |  Avg compensation vs. living wage: _______%", { after: 80 }),
    p("Diversity metrics (% underrepresented groups): Leadership _______ | Overall workforce _______", { after: 80 }),
    p("Community investment (hours + dollars): _______________________________", { after: 80 }),
    p("Supply chain ethical sourcing assessment: _______________________________"),
    blank(),
    h2("VI. Director Compensation"),
    ...O.board.map((m) => p(`${m.name} (${m.role}): $_______ total compensation`, { after: 80 })),
    blank(),
    h2("VII. Circumstances Hindering Benefit Creation"),
    p("During the reporting year, the following circumstances materially hindered our ability to create public benefit:"),
    p('[Describe any material constraints — or state "None identified" if no material hindrance occurred.]', { italic: true, color: "475569" }),
    blank(),
    h2("VIII. Future Goals"),
    p("[Describe key public benefit goals for the coming year.]", { italic: true, color: "475569" }),
    blank(480),
    divider(),
    p("CERTIFICATION", { bold: true, align: "center", after: 240 }),
    p("I certify that the information in this Annual Benefit Report is accurate and complete to the best of my knowledge.", { after: 320 }),
    p("Benefit Officer / CEO: _______________________________     Date: ________________", { after: 120 }),
    p("Secretary: _______________________________     Date: ________________"),
  ];
}
