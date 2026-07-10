// Professional Corporation (PC) document builders.
//
// Ported verbatim from formright_v2_pbc.html (second FORMRIGHT script block):
// buildArticlesPC, buildStockTransfer.
import { blank, coverBlock, divider, h1, h2, h3, p } from "../helpers";
import type { OrgData } from "../types";

// ── Professional Corp: Articles of Incorporation ──────────────────────────────
export function buildArticlesPC(O: OrgData) {
  return [
    ...coverBlock(O, "Articles of Incorporation", `Professional Corporation (PC) · State of ${O.state}`),
    h1("Articles of Incorporation"),
    p(`Professional Corporation · State of ${O.state}`, { bold: true, color: "475569" }),
    blank(),
    p(
      "IMPORTANT: Professional Corporations are subject to state-specific professional licensing laws in addition to general corporation law. All shareholders must hold a valid license to practice the profession for which the PC is organized. Consult your state's licensing board requirements before filing.",
      { bold: true, italic: true, color: "6366F1", after: 240 }
    ),
    h2("Article I — Name"),
    p(`The name of this Professional Corporation is ${O.name} (the "Corporation").`),
    blank(),
    h2("Article II — Professional Services"),
    p("The Corporation is organized for the purpose of rendering the following professional service(s):"),
    p(
      '[Specify licensed profession — e.g., "the practice of law," "the practice of medicine," "the practice of certified public accounting," "the practice of architecture"]',
      { italic: true, color: "475569", numbering: "bullets" }
    ),
    blank(),
    h2("Article III — Professional Qualifications"),
    p(`Only persons duly licensed to practice the profession specified in Article II in the State of ${O.state} may be shareholders, officers, or directors of this Corporation, except as otherwise permitted by applicable law.`),
    blank(),
    h2("Article IV — Principal Office"),
    p(`${O.address}, ${O.city}, ${O.state} ${O.zip}`),
    blank(),
    h2("Article V — Registered Agent"),
    p(`The Corporation shall maintain a registered agent in the State of ${O.state}.`),
    blank(),
    h2("Article VI — Authorized Shares"),
    p("1,000 shares of Common Stock, par value $1.00 per share (professional corporations typically issue fewer shares given shareholder eligibility restrictions)"),
    blank(),
    h2("Article VII — Board of Directors"),
    p("The initial Directors of the Corporation are:"),
    ...O.board.map((m) => p(`${m.name} — ${m.role}`, { numbering: "bullets" })),
    p("Each Director must hold a valid professional license in the State of " + O.state + " to practice the profession specified in Article II."),
    blank(),
    h2("Article VIII — Liability"),
    p(
      "Each shareholder of this Corporation shall be personally liable for all negligent or wrongful acts or omissions committed by the shareholder or by any person under the shareholder's direct supervision and control while rendering professional services on behalf of the Corporation."
    ),
    p("Shareholders shall NOT be personally liable for the negligent acts of other shareholders or other persons under the Corporation's control whom they do not directly supervise.", {
      bold: true,
    }),
    blank(),
    h2("Article IX — Dissolution"),
    p("If any shareholder ceases to be eligible to hold shares (by reason of losing professional licensure or otherwise), the Corporation shall, within the time permitted by law, transfer such shares to an eligible person or dissolve."),
    blank(),
    h2("Article X — Incorporator"),
    p(`Name: ${O.contact}`, { bold: true }),
    p("License Number: _____________________________ (License #, type, and state)"),
    p(`Address: ${O.address}, ${O.city}, ${O.state} ${O.zip}`),
    blank(480),
    divider(),
    p("IN WITNESS WHEREOF, the undersigned licensed professional and incorporator has executed these Articles on the date set forth below.", { after: 480 }),
    p("Signature: _______________________________", { after: 80 }),
    p(`${O.contact}, Incorporator & Licensed Professional`, { after: 80 }),
    p(`Date: ${O.date}`),
  ];
}

// ── Professional Corp: Stock Transfer Restriction Agreement ───────────────────
export function buildStockTransfer(O: OrgData) {
  return [
    ...coverBlock(O, "Stock Transfer Restriction Agreement", "Professional Corporation · Licensed Shareholders Only"),
    h1("Stock Transfer Restriction Agreement"),
    p('This Agreement is entered into as of ' + O.date + " among " + O.name + ' (the "Corporation") and all current shareholders listed on the signature page.', { after: 240 }),
    blank(),
    h2("1. Purpose"),
    p(`This Agreement is entered into to ensure that all shareholders of ${O.name} remain licensed to practice the profession for which the Corporation is organized, as required by the laws of the State of ${O.state}.`),
    blank(),
    h2("2. Restriction on Transfer"),
    p(
      "No shareholder may sell, transfer, assign, pledge, or otherwise dispose of any shares of the Corporation to any person unless such person holds a valid, current professional license to practice [PROFESSION] in the State of " +
        O.state +
        "."
    ),
    p("Any purported transfer in violation of this restriction shall be void and of no force or effect."),
    blank(),
    h2("3. Mandatory Repurchase Upon Loss of License"),
    h3("3.1 Notice Obligation"),
    p("If any shareholder ceases to hold a valid professional license for any reason (including suspension, revocation, expiration, or death), such shareholder shall immediately give written notice to the Corporation."),
    h3("3.2 Repurchase Price"),
    p("The Corporation shall repurchase the shares of an ineligible shareholder at the fair market value determined by the Board in good faith within 90 days of the triggering event."),
    h3("3.3 Ineligible Shareholder Rights"),
    p("During the period between loss of license and repurchase, an ineligible shareholder shall not vote, receive dividends, or participate in management."),
    blank(),
    h2("4. Right of First Refusal"),
    p("Before any proposed transfer, the transferring shareholder shall provide 30 days written notice to the Corporation. The Corporation shall have the right to purchase such shares at the proposed transfer price."),
    p("If the Corporation declines, each other shareholder shall have a secondary right of first refusal pro-rata to their ownership."),
    blank(),
    h2("5. Amendment"),
    p("This Agreement may be amended only by unanimous written consent of all shareholders."),
    blank(480),
    divider(),
    p("SHAREHOLDER SIGNATURES", { bold: true, align: "center", after: 240 }),
    ...O.board.map((m) => p(`${m.name} (${m.role}): ___________________  License #: _______________  Date: ________`, { after: 120 })),
    blank(),
    p("On behalf of the Corporation:", { bold: true, after: 160 }),
    p("By: _______________________________     Title: _______________________________", { after: 120 }),
    p("Date: ________________"),
  ];
}
