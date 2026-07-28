// Regression coverage for a real bug: generateAndStoreDocument's version
// assignment used to be a plain SELECT MAX(version) then INSERT, with no
// locking and no unique constraint to catch a collision. Two concurrent
// regenerations of the same document (a double-clicked download link, two
// open tabs) could both compute the same next version, both upload to the
// *same* storage object key (silently clobbering each other), and both
// insert a `documents` row claiming that version. These tests verify the
// fix: an advisory lock scoped to a transaction serializes the whole
// version-assign + upload + insert sequence per (registrationId, docKey).
import { describe, it, expect, vi, beforeEach } from "vitest";

const { clientQueryMock, connectMock, uploadDocumentMock, getDocumentUrlMock, generateDocBufferMock } = vi.hoisted(() => ({
  clientQueryMock: vi.fn(),
  connectMock: vi.fn(),
  uploadDocumentMock: vi.fn(),
  getDocumentUrlMock: vi.fn(),
  generateDocBufferMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({
  withClient: async (fn: (client: { query: typeof clientQueryMock }) => Promise<unknown>) => {
    const client = { query: clientQueryMock };
    connectMock();
    return fn(client);
  },
}));
vi.mock("@/lib/storage", () => ({
  uploadDocument: uploadDocumentMock,
  getDocumentUrl: getDocumentUrlMock,
}));
vi.mock("@/lib/doc-engine/generate", () => ({ generateDocBuffer: generateDocBufferMock }));
vi.mock("@/lib/doc-engine/pdf/irs1023ez", () => ({ build1023EZPrefillPdf: vi.fn() }));
vi.mock("@/lib/doc-engine/docConfig", () => ({
  DOC_CONFIG: { articles: { filename: "Articles.docx", title: "Articles", fn: vi.fn() } },
}));
vi.mock("@/lib/entities/entityDocsMap", () => ({
  getDocsForEntity: () => [{ key: "articles", title: "Articles" }],
}));

import { generateAndStoreDocument } from "@/lib/doc-engine/generateAndStore";
import type { OrgData } from "@/lib/doc-engine/types";

const ORG = { name: "Test Co" } as OrgData;

describe("generateAndStoreDocument", () => {
  beforeEach(() => {
    clientQueryMock.mockReset();
    connectMock.mockReset();
    uploadDocumentMock.mockReset().mockResolvedValue(undefined);
    getDocumentUrlMock.mockReset().mockResolvedValue("https://example.com/signed");
    generateDocBufferMock.mockReset().mockResolvedValue(Buffer.from("doc"));
  });

  it("acquires an advisory lock keyed on (registrationId, docKey) before reading the current version", async () => {
    clientQueryMock.mockImplementation((sql: string) => {
      if (sql.includes("SELECT MAX(version)")) return Promise.resolve({ rows: [{ max: 2 }] });
      return Promise.resolve({ rows: [] });
    });

    await generateAndStoreDocument("REG-1", "articles", "llc", ORG, "Test_Co");

    const calls = clientQueryMock.mock.calls.map((c) => c[0] as string);
    expect(calls[0]).toBe("BEGIN");
    expect(calls[1]).toContain("pg_advisory_xact_lock");
    expect(clientQueryMock.mock.calls[1][1]).toEqual(["REG-1:articles"]);
    // Lock must be acquired before the version read, and the version read
    // before the insert — the whole sequence run on one client/transaction.
    const maxIdx = calls.findIndex((s) => s.includes("SELECT MAX(version)"));
    const insertIdx = calls.findIndex((s) => s.includes("INSERT INTO documents"));
    expect(maxIdx).toBeGreaterThan(0);
    expect(insertIdx).toBeGreaterThan(maxIdx);
    expect(calls[calls.length - 1]).toBe("COMMIT");
  });

  it("uses a single dedicated client for the whole sequence, not one connection per query", async () => {
    clientQueryMock.mockResolvedValue({ rows: [] });
    await generateAndStoreDocument("REG-1", "articles", "llc", ORG, "Test_Co");
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it("computes version 3 after an existing max of 2, and uploads/inserts under that version", async () => {
    clientQueryMock.mockImplementation((sql: string) => {
      if (sql.includes("SELECT MAX(version)")) return Promise.resolve({ rows: [{ max: 2 }] });
      return Promise.resolve({ rows: [] });
    });

    await generateAndStoreDocument("REG-1", "articles", "llc", ORG, "Test_Co");

    expect(uploadDocumentMock).toHaveBeenCalledWith("documents/REG-1/articles-v3", expect.any(Buffer), expect.any(String));
    const insertCall = clientQueryMock.mock.calls.find((c) => (c[0] as string).includes("INSERT INTO documents"));
    expect(insertCall?.[1]).toEqual(["REG-1", "articles", "documents/REG-1/articles-v3", "Test_Co_Articles.docx", 3]);
  });

  it("rolls back and rethrows if the upload fails, without inserting a documents row", async () => {
    clientQueryMock.mockImplementation((sql: string) => {
      if (sql.includes("SELECT MAX(version)")) return Promise.resolve({ rows: [{ max: 0 }] });
      return Promise.resolve({ rows: [] });
    });
    uploadDocumentMock.mockRejectedValue(new Error("storage down"));

    await expect(generateAndStoreDocument("REG-1", "articles", "llc", ORG, "Test_Co")).rejects.toThrow("storage down");

    const calls = clientQueryMock.mock.calls.map((c) => c[0] as string);
    expect(calls.some((sql) => sql.includes("INSERT INTO documents"))).toBe(false);
    expect(calls[calls.length - 1]).toBe("ROLLBACK");
  });
});
