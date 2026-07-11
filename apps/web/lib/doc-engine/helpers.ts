// Shared docx.js builder helpers.
//
// Ported from formright_v2_pbc.html FORMRIGHT DOCUMENT GENERATION ENGINE
// script block (makeDoc, mkStyles, mkNumbering, PAGE, p/h1/h2/h3/blank/divider,
// mkHeader, mkFooter, coverBlock). The prototype pulled the docx.js classes off
// `window.docx` (loaded via CDN); here we import the real `docx` npm package
// directly. All literal strings/fonts/sizes/colors/spacing are preserved
// exactly as in the source.
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  ISectionOptions,
  LevelFormat,
  PageBreak,
  PageNumber,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import type { DocBranding, OrgData } from "./types";

// ── docx.js builder helpers ──
export function makeDoc(
  sections: ISectionOptions[],
  styles: ConstructorParameters<typeof Document>[0]["styles"],
  numbering: ConstructorParameters<typeof Document>[0]["numbering"]
) {
  return new Document({ styles, numbering, sections });
}

export function mkStyles() {
  return {
    default: { document: { run: { font: "Arial", size: 24, color: "000000" } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "0D1B2A" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "1B9AAA" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "475569" },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 },
      },
    ],
  };
}

export function mkNumbering() {
  return {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: "numbered",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: "alpha",
        levels: [
          {
            level: 0,
            format: LevelFormat.LOWER_LETTER,
            text: "(%1)",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 900, hanging: 360 } } },
          },
        ],
      },
    ],
  };
}

export const PAGE = {
  size: { width: 12240, height: 15840 },
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
};

export interface POpts {
  after?: number;
  before?: number;
  align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  numbering?: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
}

export function p(text: string, opts: POpts = {}): Paragraph {
  return new Paragraph({
    spacing: { after: opts.after ?? 160, before: opts.before ?? 0 },
    alignment: opts.align || AlignmentType.LEFT,
    ...(opts.numbering ? { numbering: { reference: opts.numbering, level: 0 } } : {}),
    children: [
      new TextRun({
        text,
        font: "Arial",
        size: opts.size || 24,
        bold: opts.bold || false,
        italics: opts.italic || false,
        color: opts.color || "000000",
      }),
    ],
  });
}

export function h1(text: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: "Arial" })] });
}
export function h2(text: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: "Arial" })] });
}
export function h3(text: string): Paragraph {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, font: "Arial" })] });
}
export function blank(after = 120): Paragraph {
  return p("", { after });
}
export function divider(): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0", space: 1 } },
    children: [],
  });
}

export function mkHeader(docName: string, orgName: string, branding?: DocBranding): Header {
  const accent = branding?.primaryColor ?? "1B9AAA";
  return new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: accent, space: 4 } },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: orgName, font: "Arial", size: 18, bold: true, color: "0D1B2A" }),
          new TextRun({ text: `\t${docName}`, font: "Arial", size: 18, color: "475569" }),
        ],
      }),
    ],
  });
}

export function mkFooter(date: string, branding?: DocBranding): Footer {
  const preparedBy = branding?.firmName ?? "FormRight";
  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0", space: 4 } },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Page ", font: "Arial", size: 18, color: "475569" }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "475569" }),
          new TextRun({ text: " of ", font: "Arial", size: 18, color: "475569" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 18, color: "475569" }),
          new TextRun({ text: `  |  ${preparedBy}  |  ${date}`, font: "Arial", size: 18, color: "475569" }),
        ],
      }),
    ],
  });
}

export function coverBlock(O: OrgData, docTitle: string, subtitle: string): Paragraph[] {
  const branding = O.branding;
  const accent = branding?.primaryColor ?? "1B9AAA";
  const preparedBy = branding?.firmName ? `Prepared by ${branding.firmName}` : "Prepared by FormRight Document Services";

  const logoParagraph = branding?.logoImage
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new ImageRun({
              data: branding.logoImage.data,
              type: branding.logoImage.type,
              transformation: { width: 160, height: 80 },
            }),
          ],
        }),
      ]
    : [];

  return [
    blank(logoParagraph.length ? 2400 : 2880),
    ...logoParagraph,
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: O.name, font: "Arial", size: 40, bold: true, color: "0D1B2A" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: docTitle, font: "Arial", size: 52, bold: true, color: accent })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
      children: [new TextRun({ text: subtitle, font: "Arial", size: 24, italics: true, color: "475569" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: preparedBy, font: "Arial", size: 20, color: "475569" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: O.date, font: "Arial", size: 20, color: "475569" })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}
