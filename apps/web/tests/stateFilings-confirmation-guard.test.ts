// Regression coverage for a real bug: filing_status could jump straight to
// "approved" with no requirement that a state_confirmation_id ever exist —
// a filing could be marked legally complete with zero evidence it was
// actually filed with the state.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ query: queryMock }));

import { updateStateFiling, MissingStateConfirmationError } from "@/lib/queries/stateFilings";

beforeEach(() => {
  queryMock.mockReset();
});

describe("updateStateFiling — confirmation-ID guard on 'approved'", () => {
  it("rejects moving to 'approved' when neither the update nor the existing row has a confirmation ID", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ state_confirmation_id: null }] }); // getStateFilingById

    await expect(updateStateFiling("FR-1", { filingStatus: "approved" })).rejects.toBeInstanceOf(
      MissingStateConfirmationError
    );
    // Never got as far as the actual UPDATE statement.
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it("allows moving to 'approved' when the confirmation ID is supplied in the same update", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: "FR-1", filing_status: "approved" }] }); // the UPDATE itself

    const result = await updateStateFiling("FR-1", { filingStatus: "approved", stateConfirmationId: "ABC123" });
    expect(result).toEqual({ id: "FR-1", filing_status: "approved" });
    // No existence-check read needed — the confirmation ID was in this call.
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it("allows moving to 'approved' when the row already has a confirmation ID from an earlier update", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ state_confirmation_id: "already-set" }] }); // getStateFilingById
    queryMock.mockResolvedValueOnce({ rows: [{ id: "FR-1", filing_status: "approved" }] }); // the UPDATE

    const result = await updateStateFiling("FR-1", { filingStatus: "approved" });
    expect(result).toEqual({ id: "FR-1", filing_status: "approved" });
  });

  it("does not guard other status transitions", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: "FR-1", filing_status: "submitted" }] });
    const result = await updateStateFiling("FR-1", { filingStatus: "submitted" });
    expect(result).toEqual({ id: "FR-1", filing_status: "submitted" });
  });
});
