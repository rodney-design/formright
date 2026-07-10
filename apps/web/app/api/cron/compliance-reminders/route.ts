import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendComplianceReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

const REMINDER_WINDOWS = [90, 60, 30];

// Reminder cron (build-order doc §Phase 2 step 6). Scheduled daily via
// vercel.json. Matches events whose due_date is *exactly* 90, 60, or 30 days
// out, so each event gets up to three reminders as its deadline approaches —
// not a "due within" range, which would re-notify every day inside the window.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dueEvents = await query<{
    id: string;
    event_type: string;
    due_date: string;
    contact_email: string;
    orgname: string;
    days_until: number;
  }>(
    `SELECT ce.id, ce.event_type, ce.due_date, r.contact_email, r.orgname,
            (ce.due_date - CURRENT_DATE) AS days_until
     FROM compliance_events ce
     JOIN registrations r ON r.id = ce.registration_id
     WHERE ce.status = 'pending'
       AND (ce.due_date - CURRENT_DATE) = ANY($1::int[])
       AND (ce.reminded_at IS NULL OR ce.reminded_at::date < CURRENT_DATE)`,
    [REMINDER_WINDOWS]
  );

  let sent = 0;
  for (const event of dueEvents.rows) {
    if (!event.contact_email) continue;
    await sendComplianceReminderEmail(
      event.contact_email,
      event.orgname,
      event.event_type,
      event.due_date,
      event.days_until
    );
    await query("UPDATE compliance_events SET reminded_at = now() WHERE id = $1", [event.id]);
    sent++;
  }

  return NextResponse.json({ checked: dueEvents.rows.length, sent });
}
