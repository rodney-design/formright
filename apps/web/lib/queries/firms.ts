import "server-only";
import { query } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";

export interface FirmBranding {
  logoUrl?: string;
  primaryColor?: string;
}

export interface Firm {
  id: string;
  name: string;
  branding: FirmBranding | null;
  created_at: string;
}

export type FirmRole = "firm_admin" | "firm_member";

export interface FirmMembership {
  firm: Firm;
  role: FirmRole;
}

export interface FirmMember {
  id: string;
  firm_id: string;
  user_id: string;
  role: FirmRole;
  invited_at: string | null;
  joined_at: string | null;
  email: string;
  name: string | null;
}

// A user can only ever have one active firm membership in this MVP (the
// unique index on (firm_id, user_id) allows multiple firms per user at the
// DB level, but the product surface — one firm dashboard per signed-in user
// — assumes a single membership; supporting multi-firm users is future work).
export async function getFirmMembershipForUser(userId: string): Promise<FirmMembership | null> {
  const result = await query<{
    id: string;
    name: string;
    branding: FirmBranding | null;
    created_at: string;
    role: FirmRole;
  }>(
    `SELECT f.id, f.name, f.branding, f.created_at, fm.role
     FROM firm_members fm
     JOIN firms f ON f.id = fm.firm_id
     WHERE fm.user_id = $1 AND fm.joined_at IS NOT NULL
     ORDER BY fm.joined_at ASC
     LIMIT 1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    firm: { id: row.id, name: row.name, branding: row.branding, created_at: row.created_at },
    role: row.role,
  };
}

export async function requireFirmMembership(): Promise<{ user: SessionUser; membership: FirmMembership }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const membership = await getFirmMembershipForUser(user.id);
  if (!membership) throw new Error("Forbidden");
  return { user, membership };
}

export async function requireFirmAdmin(): Promise<{ user: SessionUser; membership: FirmMembership }> {
  const result = await requireFirmMembership();
  if (result.membership.role !== "firm_admin") throw new Error("Forbidden");
  return result;
}

export async function getFirmMembers(firmId: string): Promise<FirmMember[]> {
  const result = await query<FirmMember>(
    `SELECT fm.id, fm.firm_id, fm.user_id, fm.role, fm.invited_at, fm.joined_at, u.email, u.name
     FROM firm_members fm
     JOIN users u ON u.id = fm.user_id
     WHERE fm.firm_id = $1
     ORDER BY fm.joined_at ASC NULLS LAST, fm.invited_at ASC`,
    [firmId]
  );
  return result.rows;
}

// "accepted on login" half of the invitation/handoff flow (build-order doc
// §Phase 4 step 5) — called from /api/auth/verify on every successful
// magic-link login. Returns the firm_ids that gained a member, so the caller
// can resync per-seat billing quantity (build-order doc §Phase 4 step 4).
export async function acceptPendingFirmInvites(userId: string): Promise<string[]> {
  const result = await query<{ firm_id: string }>(
    "UPDATE firm_members SET joined_at = now() WHERE user_id = $1 AND joined_at IS NULL RETURNING firm_id",
    [userId]
  );
  return result.rows.map((r) => r.firm_id);
}

export async function removeFirmMember(memberId: string, firmId: string): Promise<boolean> {
  const result = await query("DELETE FROM firm_members WHERE id = $1 AND firm_id = $2", [memberId, firmId]);
  return (result.rowCount ?? 0) > 0;
}

export async function countActiveFirmMembers(firmId: string): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM firm_members WHERE firm_id = $1 AND joined_at IS NOT NULL",
    [firmId]
  );
  return Number(result.rows[0]?.count ?? 0);
}
