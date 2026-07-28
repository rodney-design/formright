// Regression coverage for a real bug: the uploaded stamped-document
// filename was interpolated directly into the Supabase Storage object key
// with no sanitization. A crafted filename containing "/" could inject
// extra path segments into the key, escaping the intended
// state-filings/{id}/ prefix in the shared bucket.
import { describe, it, expect, vi, beforeEach } from "vitest";

const requireContractorMock = vi.fn();
const getContractorByUserIdMock = vi.fn();
const getStateFilingByIdMock = vi.fn();
const updateStateFilingMock = vi.fn();
const uploadDocumentMock = vi.fn();

vi.mock("@/lib/auth", () => ({ requireContractor: requireContractorMock }));
vi.mock("@/lib/queries/contractors", () => ({ getContractorByUserId: getContractorByUserIdMock }));
vi.mock("@/lib/queries/stateFilings", () => ({
  getStateFilingById: getStateFilingByIdMock,
  updateStateFiling: updateStateFilingMock,
}));
vi.mock("@/lib/storage", () => ({ uploadDocument: uploadDocumentMock }));

function makeFormRequest(filename: string) {
  const formData = new FormData();
  formData.set("stampedDoc", new File(["stamped pdf bytes"], filename, { type: "application/pdf" }));
  return new Request("http://localhost/api/contractor/state-filings/FR-100001", {
    method: "PATCH",
    body: formData,
  }) as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireContractorMock.mockResolvedValue({ id: "user-1" });
  getContractorByUserIdMock.mockResolvedValue({ id: "contractor-1" });
  getStateFilingByIdMock.mockResolvedValue({ id: "FR-100001", assigned_contractor_id: "contractor-1" });
  updateStateFilingMock.mockResolvedValue({ id: "FR-100001", filing_status: "submitted" });
  uploadDocumentMock.mockResolvedValue(undefined);
});

describe("PATCH /api/contractor/state-filings/[id] — stamped document filename sanitization", () => {
  it("strips path separators from a malicious filename before it becomes a storage key", async () => {
    const { PATCH } = await import("@/app/api/contractor/state-filings/[id]/route");
    const res = await PATCH(makeFormRequest("../../../other-firm-prefix/evil.pdf"), { params: { id: "FR-100001" } });

    expect(res.status).toBe(200);
    const [storageKey] = uploadDocumentMock.mock.calls[0];
    expect(storageKey).not.toContain("/../");
    expect(storageKey.startsWith("state-filings/FR-100001/stamped_")).toBe(true);
    // Only one "/" run per path segment — no injected extra segments.
    expect(storageKey.split("/")).toHaveLength(3);
  });

  it("preserves a normal filename's extension and readable characters", async () => {
    const { PATCH } = await import("@/app/api/contractor/state-filings/[id]/route");
    await PATCH(makeFormRequest("Delaware-Certificate_2026.pdf"), { params: { id: "FR-100001" } });

    const [storageKey] = uploadDocumentMock.mock.calls[0];
    expect(storageKey).toMatch(/Delaware-Certificate_2026\.pdf$/);
  });
});
