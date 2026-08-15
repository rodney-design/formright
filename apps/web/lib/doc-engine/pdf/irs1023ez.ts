// Server-side port of generate1023EZPrefill() (formright_v2_pbc.html,
// FORMRIGHT DOCUMENT GENERATION ENGINE script block). The prototype built
// this with `window.jspdf` (CDN global) and finished by calling `doc.save()`
// to trigger a browser download; here we import the real `jspdf` npm package
// and return the rendered PDF as a Buffer instead. All browser-only bits
// (the `event?.target` button-disabling/relabeling, the try/catch that
// called `alert()`) have been stripped. Every drawing call, coordinate,
// color, and layout constant is preserved exactly as in the source.
import { jsPDF } from "jspdf";
import type { OrgData } from "../types";

type RGB = [number, number, number];

export async function build1023EZPrefillPdf(O: OrgData): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });

  const W = 612,
    H = 792;
  const NAVY: RGB = [13, 27, 42];
  const TEAL: RGB = [27, 154, 170];
  const YELLOW: RGB = [242, 201, 76];
  const LGRAY: RGB = [241, 245, 249];
  const MGRAY: RGB = [203, 213, 225];
  const DGRAY: RGB = [71, 85, 105];
  const WHITE: RGB = [255, 255, 255];
  const GREEN: RGB = [22, 101, 52];

  // ── helpers ──────────────────────────────────────────────────────────────
  const rgb = (arr: RGB) => doc.setTextColor(...arr);
  const fill = (arr: RGB) => doc.setFillColor(...arr);
  const strk = (arr: RGB) => doc.setDrawColor(...arr);

  function headerBar(text: string, y: number, h = 18) {
    fill(NAVY);
    doc.rect(36, y, W - 72, h, "F");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    rgb(WHITE);
    doc.text(text, 42, y + h - 5);
  }
  function subBar(text: string, y: number, h = 14) {
    fill(TEAL);
    doc.rect(36, y, W - 72, h, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    rgb(WHITE);
    doc.text(text, 42, y + h - 4);
  }
  function fieldBox(label: string, value: string, x: number, y: number, w: number, h = 20, fs = 8) {
    fill(LGRAY);
    strk(MGRAY);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, w, h, 2, 2, "FD");
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    rgb(DGRAY);
    doc.text(label, x + 3, y + 8);
    doc.setFontSize(fs);
    doc.setFont("helvetica", "bold");
    rgb(NAVY);
    const maxW = w - 6;
    const truncated =
      doc.getTextWidth(value) > maxW
        ? value.substring(0, Math.floor((value.length * maxW) / doc.getTextWidth(value)) - 2) + "…"
        : value;
    doc.text(truncated, x + 3, y + h - 5);
  }
  function checkMark(x: number, y: number, checked = true, label = "") {
    strk(NAVY);
    doc.setLineWidth(1);
    doc.rect(x, y, 9, 9, "S");
    if (checked) {
      fill(TEAL);
      doc.rect(x + 1, y + 1, 7, 7, "F");
      doc.setFontSize(7);
      rgb(WHITE);
      doc.text("✓", x + 1.5, y + 7);
    }
    if (label) {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      rgb(NAVY);
      doc.text(label, x + 13, y + 7);
    }
  }
  function thinLine(y: number) {
    strk(MGRAY);
    doc.setLineWidth(0.4);
    doc.line(36, y, W - 36, y);
  }
  function wrappedText(text: string, x: number, y: number, maxW: number, lineH = 9, fs = 7) {
    doc.setFontSize(fs);
    doc.setFont("helvetica", "normal");
    const lines: string[] = doc.splitTextToSize(text, maxW);
    lines.forEach((ln, i) => doc.text(ln, x, y + i * lineH));
    return y + lines.length * lineH;
  }

  // ── FormRight branding strip ──────────────────────────────────────────────
  function frBranding() {
    fill(NAVY);
    doc.rect(0, 0, W, 26, "F");
    fill(TEAL);
    doc.rect(36, 5, 3, 16, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    rgb(WHITE);
    doc.text("FormRight", 45, 18);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    rgb([148, 163, 184]);
    doc.text("BUSINESS FORMATION · v2.0", 46, 24);
    doc.setFontSize(7);
    rgb([148, 163, 184]);
    doc.text("Pre-filled by FormRight  |  formright.org  |  File online at pay.gov", W - 38, 18, { align: "right" });
  }

  function irsHeader(y: number) {
    fill(LGRAY);
    strk(MGRAY);
    doc.setLineWidth(0.5);
    doc.rect(36, y, W - 72, 24, "FD");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    rgb(NAVY);
    doc.text("Form 1023-EZ  (Rev. April 2021)", W / 2, y + 15, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Streamlined Application for Recognition of Exemption Under Section 501(c)(3)", W / 2, y + 22, { align: "center" });
    doc.setFontSize(6);
    rgb(DGRAY);
    doc.text("OMB No. 1545-0047", 38, y + 10);
    doc.text("Dept. of the Treasury  |  Internal Revenue Service", W - 38, y + 10, { align: "right" });
  }

  function pageFooter(pageNum: number) {
    strk(MGRAY);
    doc.setLineWidth(0.4);
    doc.line(36, H - 28, W - 36, H - 28);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    rgb(DGRAY);
    doc.text(`Form 1023-EZ Pre-Fill — Generated by FormRight | formright.org — Page ${pageNum} of 3`, 36, H - 20);
    doc.text("Form 1023-EZ (Rev. 4-2021)  |  File online at pay.gov", W - 36, H - 20, { align: "right" });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ═══════════════════════════════════════════════════════════════════════
  frBranding();
  irsHeader(30);

  // Eligibility attestation
  let y = 60;
  fill([254, 249, 231]);
  strk(YELLOW);
  doc.setLineWidth(1);
  doc.rect(36, y, W - 72, 22, "FD");
  checkMark(42, y + 7, true);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  rgb(NAVY);
  doc.text("Eligibility Attestation:", 56, y + 12);
  doc.setFont("helvetica", "normal");
  rgb(NAVY);
  const attestText =
    "I have completed the Form 1023-EZ Eligibility Worksheet, am eligible to apply for exemption, and have read and understand the requirements to be exempt under section 501(c)(3).";
  wrappedText(attestText, 56, y + 19, W - 100, 8, 6.5);

  y = 86;
  headerBar("Part I  —  Identification of Applicant", y);
  y += 20;

  fieldBox("1a  Full Name of Organization", O.name, 36, y, 330, 22);
  fieldBox("1b  Care of Name (if applicable)", "", 370, y, 206, 22);
  y += 26;

  fieldBox("1c  Mailing Address", O.address, 36, y, 235, 20);
  fieldBox("1d  City", O.city, 275, y, 140, 20);
  fieldBox("1e  State", O.state, 419, y, 46, 20);
  fieldBox("1f  ZIP", O.zip, 469, y, 107, 20);
  y += 24;

  fieldBox("2  EIN", O.ein, 36, y, 100, 20);
  fieldBox("3  Fiscal Year End (MM)", O.fiscal ? O.fiscal.split(" ")[0].substring(0, 2) : "12", 140, y, 80, 20);
  fieldBox("4  Contact Person", O.contact, 224, y, 150, 20);
  fieldBox("5  Phone", O.phone || "(___) ___-____", 378, y, 100, 20);
  fieldBox("6  Fax", "", 482, y, 94, 20);
  y += 24;

  fieldBox("7  User Fee via pay.gov", "$275.00", 36, y, 180, 18);
  fieldBox("8  Website", O.website || "", 220, y, 200, 18);
  fieldBox("9b  Email", O.email, 424, y, 152, 18);
  y += 24;

  subBar("8  Officers, Directors, and/or Trustees", y, 14);
  y += 18;

  (O.board || []).slice(0, 5).forEach((m) => {
    const nameParts = (m.name || "").split(" ");
    const first = nameParts[0] || "";
    const last = nameParts.slice(1).join(" ") || "";
    fieldBox("First", first, 36, y, 70, 18, 7);
    fieldBox("Last", last, 108, y, 90, 18, 7);
    fieldBox("Title", m.role || "Director", 200, y, 100, 18, 7);
    fieldBox("Street", O.address || "", 302, y, 130, 18, 7);
    fieldBox("City/St/Zip", `${O.city}, ${O.state} ${O.zip}`, 434, y, 142, 18, 7);
    y += 21;
  });
  // blank rows to 5 total
  for (let i = (O.board || []).length; i < 5; i++) {
    (["First", "Last", "Title", "Street", "City/St/Zip"] as const).forEach((lbl, idx) => {
      const xs = [36, 108, 200, 302, 434];
      const ws = [70, 90, 100, 130, 142];
      fieldBox(lbl, "", xs[idx], y, ws[idx], 18, 7);
    });
    y += 21;
  }
  y += 4;

  headerBar("Part II  —  Organizational Structure", y);
  y += 10;
  checkMark(42, y, true, "Corporation");
  checkMark(160, y, false, "Unincorporated Association");
  checkMark(320, y, false, "Trust");
  y += 18;

  const part2items = [
    "I have the organizing document for the organizational structure indicated above.",
    `Date incorporated: ${O.incDate || "(see Articles of Incorporation)"}  (MMDDYYYY format)`,
    `State of incorporation:  ${O.state}`,
    "Organizing document limits purposes to one or more exempt purposes under section 501(c)(3).",
    "Organizing document does not empower activities not in furtherance of exempt purposes.",
    "Organizing document contains dissolution provision required under section 501(c)(3) or state law applies.",
  ];
  part2items.forEach((txt) => {
    checkMark(38, y, true);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    rgb(NAVY);
    doc.text(txt, 52, y + 7);
    y += 15;
    thinLine(y - 2);
  });

  pageFooter(1);

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 2
  // ═══════════════════════════════════════════════════════════════════════
  doc.addPage();
  frBranding();
  y = 36;

  headerBar("Part III  —  Your Specific Activities", y);
  y += 8;

  const missionTrunc = (O.mission || "").substring(0, 250);
  fieldBox("1  Mission / Most Significant Activities  (250 char limit)", missionTrunc, 36, y, W - 72, 26, 7.5);
  y += 32;

  fieldBox("2  NTEE Code  (3-character)", "B60", 36, y, 110, 20, 10);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  rgb(DGRAY);
  doc.text("B60 = Adult, Continuing Education  |  Find yours: IRS 1023-EZ instructions Appendix D", 152, y + 12);
  y += 26;

  subBar("3  Exempt Purposes  —  check all that apply", y, 14);
  y += 18;
  const purposes = [
    "Charitable",
    "Scientific",
    "Testing for public safety",
    "Religious",
    "Literary",
    "Educational",
    "Foster amateur sports competition",
    "Prevent cruelty to children/animals",
  ];
  purposes.forEach((pu, i) => {
    const col = i % 2,
      row = Math.floor(i / 2);
    const cx = 36 + (col * (W - 72)) / 2,
      cy = y + row * 14;
    checkMark(cx, cy, ["Charitable", "Educational"].includes(pu), pu);
  });
  y += Math.ceil(purposes.length / 2) * 14 + 4;

  // Prohibition attestation box
  fill([240, 253, 244]);
  strk([134, 239, 172]);
  doc.setLineWidth(0.8);
  doc.rect(36, y, W - 72, 40, "FD");
  checkMark(42, y + 8, true);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  rgb(GREEN);
  doc.text("4  Prohibitions Attestation  —  I attest to all of the following:", 56, y + 10);
  const prohibits = [
    "Refrain from political campaign activity",
    "Net earnings don't inure to private individuals",
    "Not organized for primary purpose of unrelated business",
    "Not devote substantial activities to influencing legislation",
    "Not provide commercial-type insurance as substantial activity",
  ];
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  rgb(NAVY);
  prohibits.forEach((item, i) => doc.text(`•  ${item}`, 60, y + 20 + i * 8));
  y += 46;

  subBar("Questions 5 – 12  (Yes / No)", y, 14);
  y += 18;
  const questions: [number, string, boolean][] = [
    [5, "Do you or will you attempt to influence legislation?", false],
    [6, "Do you or will you pay compensation to officers, directors, or trustees?", false],
    [7, "Do you or will you donate funds to or pay expenses for individual(s)?", false],
    [8, "Do you or will you conduct activities outside the United States?", false],
    [9, "Do you or will you engage in financial transactions with officers/directors/trustees?", false],
    [10, "Do you or will you have unrelated business gross income of $1,000 or more?", false],
    [11, "Do you or will you operate bingo or other gaming activities?", false],
    [12, "Do you or will you provide disaster relief?", false],
  ];
  questions.forEach(([n, q, ans]) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    rgb(NAVY);
    doc.text(`${n}  ${q}`, 38, y + 2);
    checkMark(W - 120, y - 5, ans, "Yes");
    checkMark(W - 80, y - 5, !ans, "No");
    thinLine(y + 4);
    y += 14;
  });
  y += 6;

  headerBar("Part IV  —  Foundation Classification", y);
  y += 10;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  rgb(NAVY);
  doc.text("1  Are you applying as a church, school, or hospital?", 38, y);
  checkMark(W - 120, y - 7, false, "Yes");
  checkMark(W - 80, y - 7, true, "No");
  thinLine(y + 4);
  y += 16;

  const pubOptions: [string, boolean, string][] = [
    [
      "2a",
      true,
      "Normally receive ≥1/3 of support from public sources, or ≥10% with other public support characteristics. Sec. 509(a)(1) ← SELECTED",
    ],
    [
      "2b",
      false,
      "Normally receive >1/3 of support from gifts, grants, membership fees, and related receipts; ≤1/3 from investment income. Sec. 509(a)(2)",
    ],
    ["2c", false, "Operated for benefit of college/university owned by a government unit. Sec. 509(a)(1) and 170(b)(1)(A)(iv)"],
  ];
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  rgb(NAVY);
  doc.text("2  Public Charity Status:", 38, y);
  y += 12;
  pubOptions.forEach(([num, sel, desc]) => {
    checkMark(42, y, sel);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    rgb(sel ? NAVY : DGRAY);
    const lines: string[] = doc.splitTextToSize(`${num}  ${desc}`, W - 100);
    lines.forEach((ln, i) => doc.text(ln, 56, y + 7 + i * 8));
    y += 8 + lines.length * 8 + 4;
  });

  pageFooter(2);

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 3
  // ═══════════════════════════════════════════════════════════════════════
  doc.addPage();
  frBranding();
  y = 36;

  headerBar("Part V  —  Reinstatement After Automatic Revocation  (Leave blank for new applicants)", y);
  y += 12;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  rgb(DGRAY);
  doc.text("Complete only if applying for reinstatement after automatic revocation. New organizations leave blank.", 38, y);
  checkMark(38, y + 8, false, "1  Retroactive reinstatement under Rev. Proc. 2014-11, Section 4");
  checkMark(38, y + 22, false, "2  Reinstatement effective date of filing under Rev. Proc. 2014-11, Section 7");
  y += 40;

  headerBar("Part VI  —  Signature", y);
  y += 8;
  fill([254, 249, 231]);
  strk(YELLOW);
  doc.setLineWidth(1);
  doc.rect(36, y, W - 72, 58, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  rgb(NAVY);
  doc.text("I declare under the penalties of perjury that I am authorized to sign this application on behalf of the above organization", 40, y + 10);
  doc.text("and that I have examined this application, and to the best of my knowledge it is true, correct, and complete.", 40, y + 19);
  fieldBox("Typed Name of Signer", O.contact, 40, y + 26, 200, 18, 8);
  fieldBox("Title / Authority", O.ctitle || "Authorized Officer", 248, y + 26, 180, 18, 8);
  fieldBox("Date", "___/___/______", 432, y + 26, 130, 18, 8);
  y += 70;

  headerBar("How to File This Application  —  Step-by-Step", y);
  y += 12;
  const steps: [string, string][] = [
    ["Step 1", "Create a free account at pay.gov  →  https://www.pay.gov"],
    ["Step 2", 'In the pay.gov search box, type "1023-EZ" and open the form.'],
    ["Step 3", "Enter all information from this pre-filled document exactly as shown above."],
    ["Step 4", "Attach your Articles of Incorporation and Bylaws (PDF format)."],
    ["Step 5", "Pay the $275 user fee by credit/debit card or bank account."],
    ["Step 6", "Submit. You will receive an email confirmation. Processing: ~2–4 weeks."],
    ["Step 7", "Watch for your IRS Determination Letter (CP 575) by mail."],
  ];
  steps.forEach(([lbl, text]) => {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    rgb(TEAL);
    doc.text(`${lbl}:`, 40, y);
    doc.setFont("helvetica", "normal");
    rgb(NAVY);
    doc.text(text, 100, y);
    thinLine(y + 4);
    y += 14;
  });
  y += 8;

  headerBar("Important Notes", y);
  y += 10;
  const notes = [
    "This document is a preparation aid. You MUST enter all information directly on pay.gov — the IRS does not accept paper 1023-EZ.",
    `Confirm your NTEE Code (B60 = Adult Education) matches your activities. See IRS 1023-EZ Instructions Appendix D for the full list.`,
    `EIN (${O.ein}) must be obtained before filing. Apply free at IRS.gov → Apply for EIN Online if still pending.`,
    "Public charity status 509(a)(1)/170(b)(1)(A)(vi) selected. This requires receiving ≥1/3 of support from public sources.",
    "Questions? Contact FormRight at support@formright.org  |  formright.org",
  ];
  notes.forEach((note) => {
    doc.setFontSize(6.8);
    doc.setFont("helvetica", "normal");
    rgb(NAVY);
    const lines: string[] = doc.splitTextToSize(`•  ${note}`, W - 80);
    lines.forEach((ln, i) => doc.text(ln, 42, y + i * 8));
    y += lines.length * 8 + 4;
    thinLine(y);
  });
  y += 10;

  fill(LGRAY);
  doc.rect(36, y, W - 72, 28, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  rgb(TEAL);
  doc.text("Generated by FormRight  |  formright.org  |  hello@formright.org", W / 2, y + 12, { align: "center" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  rgb(DGRAY);
  doc.text("This document is a preparation aid and does not constitute legal advice. Consult a qualified attorney for legal guidance.", W / 2, y + 22, {
    align: "center",
  });

  pageFooter(3);

  // ── Output as a Buffer (server-side equivalent of the browser doc.save()) ──
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
