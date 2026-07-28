// Shared guard for the "staff/contractor uploads a scanned document" routes
// (stamped state-filing certificates, IRS determination letters). Previously
// each route interpolated the raw, client-supplied File.name straight into
// the storage key with no size or content-type check.
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB — plenty for a scanned PDF/photo

const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/bmp",
  "image/webp",
]);

// Strips any path component and anything that isn't a safe filename
// character, so a name like `../../etc/passwd` or one containing storage-key
// delimiters can't affect the resulting object key.
export function sanitizeUploadFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() || "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.slice(-100) || "file";
}

export function validateUploadedFile(file: File): { error: string } | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: `File too large — max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB` };
  }
  if (file.type && !ALLOWED_CONTENT_TYPES.has(file.type)) {
    return { error: "Unsupported file type — PDF or image only" };
  }
  return null;
}
