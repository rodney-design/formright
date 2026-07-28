// Regression coverage for a real bug: the reminder-sending loop had no
// per-event error isolation. One failed send threw and aborted the whole
// loop, silently dropping every reminder queued after it in that run — and
// since the matching query uses an exact day-count (90/60/30), a skipped
// event never gets caught up on a later run.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryMock, sendComplianceReminderEmailMock, captureExceptionMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  sendComplianceReminderEmailMock: vi.fn(),
  captureExceptionMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ query: queryMock }));
vi.mock("@/lib/email", () => ({ sendComplianceReminderEmail: sendComplianceReminderEmailMock }));
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));

async function makeRequest() {
  const { NextRequest } = await import("next/server");
  return new NextRequest("http://localhost/api/cron/compliance-reminders", {
    headers: { authorization: "Bearer test-cron-secret" },
  });
}

const THREE_EVENTS = [
  { id: "ev-1", event_type: "annual_report", due_date: "2026-10-15", contact_email: "a@example.com", orgname: "A Co", days_until: 90 },
  { id: "ev-2", event_type: "annual_report", due_date: "2026-09-15", contact_email: "b@example.com", orgname: "B Co", days_until: 60 },
  { id: "ev-3", event_type: "annual_report", due_date: "2026-08-16", contact_email: "c@example.com", orgname: "C Co", days_until: 30 },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", "test-cron-secret");
  queryMock.mockImplementation((sql: string) => {
    if (sql.includes("SELECT")) return Promise.resolve({ rows: THREE_EVENTS });
    return Promise.resolve({ rows: [] }); // the per-event UPDATE
  });
});

describe("GET /api/cron/compliance-reminders — per-event error isolation", () => {
  it("still sends the remaining reminders when one email send fails", async () => {
    sendComplianceReminderEmailMock
      .mockResolvedValueOnce(undefined) // ev-1 succeeds
      .mockRejectedValueOnce(new Error("SendGrid rejected the request")) // ev-2 fails
      .mockResolvedValueOnce(undefined); // ev-3 must still be attempted

    const { GET } = await import("@/app/api/cron/compliance-reminders/route");
    const res = await GET(await makeRequest());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(sendComplianceReminderEmailMock).toHaveBeenCalledTimes(3); // all 3 attempted, not aborted after ev-2
    expect(json).toEqual({ checked: 3, sent: 2, failed: 1 });
    expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
  });

  it("only marks reminded_at for events that actually sent successfully", async () => {
    sendComplianceReminderEmailMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce(undefined);

    const { GET } = await import("@/app/api/cron/compliance-reminders/route");
    await GET(await makeRequest());

    const updateCalls = queryMock.mock.calls.filter(([sql]) => sql.includes("UPDATE compliance_events"));
    const updatedIds = updateCalls.map(([, params]) => params[0]);
    expect(updatedIds).toEqual(["ev-1", "ev-3"]); // ev-2 (the failed send) must not be marked reminded
  });

  it("sends all reminders and reports zero failures on the happy path", async () => {
    sendComplianceReminderEmailMock.mockResolvedValue(undefined);

    const { GET } = await import("@/app/api/cron/compliance-reminders/route");
    const res = await GET(await makeRequest());
    const json = await res.json();

    expect(json).toEqual({ checked: 3, sent: 3, failed: 0 });
  });
});
