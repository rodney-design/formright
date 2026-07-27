import "server-only";
import { query } from "@/lib/db";
import type {
  Contractor,
  ContractorWithUser,
  ContractorJob,
  ContractorPayout,
  ContractorStatus,
  FilingChecklistItem,
} from "@/lib/contractors/types";
import { DEFAULT_FILING_CHECKLIST } from "@/lib/contractors/checklist";

export async function getContractorByUserId(userId: string): Promise<Contractor | null> {
  const result = await query<Contractor>("SELECT * FROM contractors WHERE user_id = $1", [userId]);
  return result.rows[0] ?? null;
}

export async function getContractorById(id: string): Promise<ContractorWithUser | null> {
  const result = await query<ContractorWithUser>(
    `SELECT c.*, u.email, u.name FROM contractors c JOIN users u ON u.id = c.user_id WHERE c.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getAllContractors(): Promise<ContractorWithUser[]> {
  const result = await query<ContractorWithUser>(
    `SELECT c.*, u.email, u.name FROM contractors c JOIN users u ON u.id = c.user_id ORDER BY c.created_at DESC`
  );
  return result.rows;
}

// Find-or-create the underlying user by email (same pattern as
// api/checkout/route.ts), promote them to the contractor role, and create
// their contractors row. A user can only be one contractor row (UNIQUE
// user_id) — calling this again for the same email is a no-op that returns
// the existing row rather than erroring, since re-inviting the same person
// isn't an error case worth surfacing to the admin.
export async function createContractorForEmail(
  email: string,
  name: string | undefined,
  statesCovered: string[]
): Promise<Contractor> {
  const existingUser = await query<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
  let userId: string;
  if (existingUser.rows.length > 0) {
    userId = existingUser.rows[0].id;
    await query("UPDATE users SET role = 'contractor' WHERE id = $1 AND role = 'client'", [userId]);
  } else {
    const inserted = await query<{ id: string }>(
      "INSERT INTO users (email, name, role) VALUES ($1, $2, 'contractor') RETURNING id",
      [email, name ?? null]
    );
    userId = inserted.rows[0].id;
  }

  const existingContractor = await getContractorByUserId(userId);
  if (existingContractor) return existingContractor;

  const result = await query<Contractor>(
    "INSERT INTO contractors (user_id, states_covered) VALUES ($1, $2) RETURNING *",
    [userId, statesCovered]
  );
  return result.rows[0];
}

export async function updateContractorStatus(id: string, status: ContractorStatus): Promise<Contractor | null> {
  const result = await query<Contractor>("UPDATE contractors SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
  return result.rows[0] ?? null;
}

// ── Assignment ───────────────────────────────────────────────────────────

export async function assignContractorToStateFiling(stateFilingId: string, contractorId: string | null): Promise<void> {
  await query("UPDATE state_filings SET assigned_contractor_id = $1, updated_at = now() WHERE id = $2", [
    contractorId,
    stateFilingId,
  ]);
  if (contractorId) {
    await ensureChecklistForStateFiling(stateFilingId);
  }
}

export async function assignContractorToRegisteredAgentOrder(orderId: string, contractorId: string | null): Promise<void> {
  await query("UPDATE registered_agent_orders SET assigned_contractor_id = $1, updated_at = now() WHERE id = $2", [
    contractorId,
    orderId,
  ]);
}

// ── Checklist ────────────────────────────────────────────────────────────

export async function ensureChecklistForStateFiling(stateFilingId: string): Promise<void> {
  const existing = await query<{ id: string }>("SELECT id FROM filing_checklist_items WHERE state_filing_id = $1 LIMIT 1", [
    stateFilingId,
  ]);
  if (existing.rows.length > 0) return;

  for (let i = 0; i < DEFAULT_FILING_CHECKLIST.length; i++) {
    await query("INSERT INTO filing_checklist_items (state_filing_id, label, sort_order) VALUES ($1, $2, $3)", [
      stateFilingId,
      DEFAULT_FILING_CHECKLIST[i],
      i,
    ]);
  }
}

export async function getChecklistItemsForStateFiling(stateFilingId: string): Promise<FilingChecklistItem[]> {
  const result = await query<FilingChecklistItem>(
    "SELECT * FROM filing_checklist_items WHERE state_filing_id = $1 ORDER BY sort_order ASC",
    [stateFilingId]
  );
  return result.rows;
}

export async function getChecklistItemWithOwnership(
  itemId: string
): Promise<{ item: FilingChecklistItem; assignedContractorId: string | null } | null> {
  const result = await query<FilingChecklistItem & { filing_assigned_contractor_id: string | null }>(
    `SELECT ci.*, sf.assigned_contractor_id AS filing_assigned_contractor_id
     FROM filing_checklist_items ci
     JOIN state_filings sf ON sf.id = ci.state_filing_id
     WHERE ci.id = $1`,
    [itemId]
  );
  const row = result.rows[0];
  if (!row) return null;
  const { filing_assigned_contractor_id, ...item } = row;
  return { item, assignedContractorId: filing_assigned_contractor_id };
}

export async function setChecklistItemCompleted(
  itemId: string,
  contractorId: string,
  completed: boolean
): Promise<FilingChecklistItem | null> {
  const result = await query<FilingChecklistItem>(
    `UPDATE filing_checklist_items
     SET completed_at = CASE WHEN $1 THEN now() ELSE NULL END,
         completed_by = CASE WHEN $1 THEN $2 ELSE NULL END
     WHERE id = $3
     RETURNING *`,
    [completed, contractorId, itemId]
  );
  return result.rows[0] ?? null;
}

// ── Jobs ─────────────────────────────────────────────────────────────────

export async function getJobsForContractor(contractorId: string): Promise<ContractorJob[]> {
  const filings = await query<{ id: string; registration_id: string; state: string; filing_status: string; orgname: string }>(
    `SELECT sf.id, sf.registration_id, sf.state, sf.filing_status, r.orgname
     FROM state_filings sf
     JOIN registrations r ON r.id = sf.registration_id
     WHERE sf.assigned_contractor_id = $1
     ORDER BY sf.updated_at DESC`,
    [contractorId]
  );
  const orders = await query<{ id: string; registration_id: string; status: string; orgname: string; state: string }>(
    `SELECT rao.id, rao.registration_id, rao.status, r.orgname, r.state
     FROM registered_agent_orders rao
     JOIN registrations r ON r.id = rao.registration_id
     WHERE rao.assigned_contractor_id = $1
     ORDER BY rao.updated_at DESC`,
    [contractorId]
  );

  return [
    ...filings.rows.map((f) => ({
      kind: "state_filing" as const,
      id: f.id,
      registrationId: f.registration_id,
      orgname: f.orgname,
      state: f.state,
      status: f.filing_status,
    })),
    ...orders.rows.map((o) => ({
      kind: "registered_agent_order" as const,
      id: o.id,
      registrationId: o.registration_id,
      orgname: o.orgname,
      state: o.state,
      status: o.status,
    })),
  ];
}

// ── Payouts ──────────────────────────────────────────────────────────────

export async function getPayoutsForContractor(contractorId: string): Promise<ContractorPayout[]> {
  const result = await query<ContractorPayout>(
    "SELECT * FROM contractor_payouts WHERE contractor_id = $1 ORDER BY created_at DESC",
    [contractorId]
  );
  return result.rows;
}

export async function getPendingPayoutTotalCents(contractorId: string): Promise<number> {
  const result = await query<{ total: string | null }>(
    "SELECT SUM(amount_cents) AS total FROM contractor_payouts WHERE contractor_id = $1 AND status = 'pending'",
    [contractorId]
  );
  return Number(result.rows[0]?.total ?? 0);
}

export async function createPayout(
  contractorId: string,
  amountCents: number,
  stateFilingId: string | null
): Promise<ContractorPayout> {
  const result = await query<ContractorPayout>(
    "INSERT INTO contractor_payouts (contractor_id, amount_cents, state_filing_id) VALUES ($1, $2, $3) RETURNING *",
    [contractorId, amountCents, stateFilingId]
  );
  return result.rows[0];
}

export async function markPayoutPaid(payoutId: string): Promise<ContractorPayout | null> {
  const result = await query<ContractorPayout>(
    "UPDATE contractor_payouts SET status = 'paid', paid_at = now() WHERE id = $1 RETURNING *",
    [payoutId]
  );
  return result.rows[0] ?? null;
}
