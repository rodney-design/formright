import "server-only";
import { query } from "@/lib/db";
import { fetchExternalImageSafely } from "@/lib/ssrfGuard";
import type { DocBranding } from "./types";

type LogoType = "png" | "jpg" | "gif" | "bmp";

const CONTENT_TYPE_MAP: Record<string, LogoType> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/bmp": "bmp",
};

// White-label PDF generation (build-order doc §Phase 4 step 2). Fetches the
// firm's logo bytes up front so the (synchronous, pure) docx builder
// functions never need to do I/O — see lib/doc-engine/types.ts's DocBranding.
// Logo fetch failures fall back to text-only branding rather than failing
// document generation entirely.
export async function getFirmBrandingForRegistration(firmId: string | null | undefined): Promise<DocBranding | undefined> {
  if (!firmId) return undefined;

  const result = await query<{ name: string; branding: { logoUrl?: string; primaryColor?: string } | null }>(
    "SELECT name, branding FROM firms WHERE id = $1",
    [firmId]
  );
  const firm = result.rows[0];
  if (!firm) return undefined;

  const branding: DocBranding = { firmName: firm.name, primaryColor: firm.branding?.primaryColor };

  const logoUrl = firm.branding?.logoUrl;
  if (logoUrl) {
    // A firm admin controls this URL — fetchExternalImageSafely enforces
    // https, resolves DNS and rejects private/link-local/metadata addresses
    // (e.g. 169.254.169.254), caps the response size, and times out, so this
    // can't be turned into SSRF against internal services.
    const fetched = await fetchExternalImageSafely(logoUrl);
    if (fetched) {
      const contentType = fetched.contentType?.split(";")[0].trim().toLowerCase();
      const type = contentType ? CONTENT_TYPE_MAP[contentType] : undefined;
      if (type) {
        branding.logoImage = { data: fetched.bytes, type };
      }
    }
  }

  return branding;
}
