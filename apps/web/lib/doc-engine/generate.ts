// Server-side equivalent of generateDocBlob() (formright_v2_pbc.html,
// FORMRIGHT DOCUMENT GENERATION ENGINE, and its override in the second
// script block that widens lookup to include EXTENDED_DOC_CONFIG). Instead
// of `Packer.toBlob()` (browser-only), this uses `Packer.toBuffer()` for use
// in a Next.js API route / server action.
import { Document, Packer } from "docx";
import { DOC_CONFIG } from "./docConfig";
import { mkFooter, mkHeader, mkNumbering, mkStyles, PAGE } from "./helpers";
import type { OrgData } from "./types";

export async function generateDocBuffer(key: string, org: OrgData): Promise<Buffer> {
  const cfg = DOC_CONFIG[key];
  if (!cfg) throw new Error("Unknown document: " + key);

  const children = cfg.fn(org);
  const doc = new Document({
    styles: mkStyles(),
    numbering: mkNumbering(),
    sections: [
      {
        properties: { page: PAGE },
        headers: { default: mkHeader(cfg.title, org.name) },
        footers: { default: mkFooter(org.date) },
        children,
      },
    ],
  });
  return await Packer.toBuffer(doc);
}
