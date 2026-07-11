import "server-only";
import { query } from "@/lib/db";

export interface ComplianceEventRow {
  id: string;
  registration_id: string;
  event_type: string;
  due_date: string;
  status: string;
  reminded_at: string | null;
}

// AI assistant context (build-order doc §Phase 5 step 1): the assistant is
// grounded in the user's own compliance_events, not general knowledge.
export async function getComplianceEventsForUser(userId: string): Promise<ComplianceEventRow[]> {
  const result = await query<ComplianceEventRow>(
    `SELECT ce.id, ce.registration_id, ce.event_type, ce.due_date, ce.status, ce.reminded_at
     FROM compliance_events ce
     JOIN registrations r ON r.id = ce.registration_id
     WHERE r.user_id = $1
     ORDER BY ce.due_date ASC`,
    [userId]
  );
  return result.rows;
}
