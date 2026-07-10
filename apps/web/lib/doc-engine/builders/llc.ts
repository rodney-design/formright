// LLC-specific document builders.
//
// Ported verbatim from formright_v2_pbc.html (second FORMRIGHT script block):
// buildArticlesLLC, buildOperatingAgreement.
import { blank, coverBlock, divider, h1, h2, h3, p } from "../helpers";
import type { OrgData } from "../types";

export function buildArticlesLLC(O: OrgData) {
  return [
    ...coverBlock(O, "Articles of Organization", `Limited Liability Company · State of ${O.state}`),
    h1("Articles of Organization"),
    p(`State of ${O.state}`, { bold: true, color: "475569" }),
    blank(),
    h2("Article I — Name"),
    p(`The name of this Limited Liability Company is ${O.name} (the "Company").`),
    blank(),
    h2("Article II — Purpose"),
    p(
      `The purpose of the Company is to engage in any lawful act or activity for which a limited liability company may be organized under the laws of the State of ${O.state}.`
    ),
    p(O.mission ? `Primary Business Purpose: "${O.mission}"` : "", { italic: true }),
    blank(),
    h2("Article III — Principal Office"),
    p(`${O.address}, ${O.city}, ${O.state} ${O.zip}`),
    blank(),
    h2("Article IV — Registered Agent"),
    p(`The Company shall maintain a registered agent in the State of ${O.state} with a physical street address in the state as required by law.`),
    blank(),
    h2("Article V — Management"),
    p(`The Company shall be managed by: ☐ Member(s)   ☐ Manager(s)`),
    p(`(Check the appropriate box and specify names of managers if manager-managed.)`, { italic: true, color: "475569", size: 20 }),
    blank(),
    h2("Article VI — Members"),
    p("The initial member(s) of the Company are:"),
    ...O.board.map((m) => p(`${m.name} — ${m.role}`, { numbering: "bullets" })),
    blank(),
    h2("Article VII — Duration"),
    p(`The duration of the Company shall be perpetual unless dissolved in accordance with applicable law.`),
    blank(),
    h2("Article VIII — Liability"),
    p(
      "The debts, obligations, and liabilities of the Company are solely the debts, obligations, and liabilities of the Company. No member shall be personally liable for any such debt, obligation, or liability solely by reason of being a member."
    ),
    blank(),
    h2("Article IX — Organizer"),
    p(`Name: ${O.contact}`, { bold: true }),
    p(`Address: ${O.address}, ${O.city}, ${O.state} ${O.zip}`),
    blank(480),
    divider(),
    p("IN WITNESS WHEREOF, the undersigned organizer has executed these Articles on the date set forth below.", { after: 480 }),
    p("Signature: _______________________________", { after: 80 }),
    p(`${O.contact}, Organizer`, { after: 80 }),
    p(`Date: ${O.date}`),
  ];
}

export function buildOperatingAgreement(O: OrgData) {
  const isMulti = O.board && O.board.length > 1;
  const memberList = O.board && O.board.length > 0 ? O.board : [{ name: O.contact, role: "Managing Member" }];
  return [
    ...coverBlock(O, "Operating Agreement", `${isMulti ? "Multi" : "Single"}-Member LLC · State of ${O.state}`),
    h1(`Operating Agreement of ${O.name}`),
    p("Effective Date: " + O.date, { color: "475569" }),
    blank(),
    p(
      "IMPORTANT: This Operating Agreement governs the internal affairs of the Company and is binding on all members. Review with legal counsel before executing for complex arrangements.",
      { bold: true, italic: true, color: "1B9AAA", after: 240 }
    ),
    h2("Article 1 — Formation"),
    h3("1.1 Formation"),
    p(`The members hereby form a Limited Liability Company under the laws of the State of ${O.state} pursuant to the Articles of Organization filed with the Secretary of State.`),
    h3("1.2 Name"),
    p(`The Company name is ${O.name}.`),
    h3("1.3 Principal Office"),
    p(`${O.address}, ${O.city}, ${O.state} ${O.zip}.`),
    h3("1.4 Purpose"),
    p(O.mission || `To engage in any lawful business activity.`),
    blank(),
    h2("Article 2 — Members and Ownership"),
    h3("2.1 Initial Members"),
    p("The initial members and their ownership percentages are:"),
    ...memberList.map((m, i) =>
      p(`${m.name} (${m.role}) — ${isMulti ? Math.floor(100 / memberList.length) + (i === 0 ? 100 % memberList.length : 0) : 100}%`, {
        numbering: "bullets",
      })
    ),
    blank(),
    h3("2.2 Additional Members"),
    p("New members may be admitted only upon unanimous written consent of all existing members."),
    h3("2.3 Transferability"),
    p("No member may transfer or assign any interest in the Company without prior written consent of all other members."),
    blank(),
    h2("Article 3 — Management"),
    h3("3.1 Management Structure"),
    p(
      isMulti
        ? 'The Company shall be managed by its members ("Member-Managed"), with each member having authority proportional to ownership.'
        : `The Company shall be managed by the sole member: ${O.contact}.`
    ),
    h3("3.2 Voting"),
    p(
      isMulti
        ? "Decisions require approval by members holding a majority of ownership interests, except as otherwise provided."
        : "As the sole member, all decisions are made unilaterally by the member."
    ),
    h3("3.3 Officers"),
    p("The members may appoint officers (President, Vice President, Secretary, Treasurer) to manage day-to-day operations."),
    blank(),
    h2("Article 4 — Capital Contributions"),
    h3("4.1 Initial Contributions"),
    p("Each member shall make the initial capital contributions set forth on Exhibit A attached hereto."),
    h3("4.2 Additional Contributions"),
    p("No member shall be required to make additional capital contributions without that member's prior written consent."),
    blank(),
    h2("Article 5 — Distributions"),
    h3("5.1 Timing"),
    p("Distributions shall be made at such times and in such amounts as the members determine by majority vote."),
    h3("5.2 Allocation"),
    p("Profits and losses shall be allocated in proportion to each member's ownership percentage."),
    blank(),
    h2("Article 6 — Tax Treatment"),
    p(
      isMulti
        ? "The Company shall be treated as a partnership for federal income tax purposes unless an election is made to be treated as a corporation."
        : "The Company shall be treated as a disregarded entity for federal income tax purposes unless an election is made to be treated as a corporation."
    ),
    blank(),
    h2("Article 7 — Dissolution"),
    p(
      "The Company may be dissolved upon unanimous written consent of all members, or as otherwise required by state law. Upon dissolution, assets shall be applied first to creditors, then distributed to members in proportion to ownership."
    ),
    blank(480),
    divider(),
    p("SIGNATURE PAGE", { bold: true, align: "center", after: 240 }),
    ...memberList.map((m) => p(`${m.name}, Member: _______________________________     Date: ________________`, { after: 120 })),
  ];
}
