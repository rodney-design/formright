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

export interface PendingFirmInvite {
  firm: Firm;
  role: FirmRole;
}

// Pending invites for a user — one per firm that has invited this email and
// hasn't been accepted or declined yet. Surfaced explicitly (see
// acceptFirmInvite/declineFirmInvite below) rather than auto-joined on login:
// a firm admin can invite any email address, and silently joining the firm
// the moment that person next logs in *for any reason* — even to check their
// own unrelated retail account — used to redirect them into the firm
// dashboard and increase the firm's Stripe seat bill with no consent step.
export async function getPendingFirmInvitesForUser(userId: string): Promise<PendingFirmInvite[]> {
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
     WHERE fm.user_id = $1 AND fm.joined_at IS NULL
     ORDER BY fm.invited_at ASC`,
    [userId]
  );
  return result.rows.map((row) => ({
    firm: { id: row.id, name: row.name, branding: row.branding, created_at: row.created_at },
    role: row.role,
  }));
}

// Explicit accept — only called from a user-initiated "Join {firm}?"
// confirmation, never automatically. Syncing seat quantity is the caller's
// responsibility (mirrors the existing convention in /api/auth/verify).
export async function acceptFirmInvite(userId: string, firmId: string): Promise<boolean> {
  const result = await query(
    "UPDATE firm_members SET joined_at = now() WHERE user_id = $1 AND firm_id = $2 AND joined_at IS NULL",
    [userId, firmId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function declineFirmInvite(userId: string, firmId: string): Promise<boolean> {
  const result = await query(
    "DELETE FROM firm_members WHERE user_id = $1 AND firm_id = $2 AND joined_at IS NULL",
    [userId, firmId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function removeFirmMember(
  memberId: string,
  firmId: string
): Promise<{ ok: boolean; error?: "not_found" | "last_admin" }> {
  const member = await query<{ role: FirmRole; joined_at: string | null }>(
    "SELECT role, joined_at FROM firm_members WHERE id = $1 AND firm_id = $2",
    [memberId, firmId]
  );
  const row = member.rows[0];
  if (!row) return { ok: false, error: "not_found" };

  // Removing the last active admin would orphan the firm — nobody left who
  // can invite/remove members or manage billing.
  if (row.role === "firm_admin" && row.joined_at !== null) {
    const adminCount = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM firm_members WHERE firm_id = $1 AND role = 'firm_admin' AND joined_at IS NOT NULL",
      [firmId]
    );
    if (Number(adminCount.rows[0]?.count ?? 0) <= 1) {
      return { ok: false, error: "last_admin" };
    }
  }

  const result = await query("DELETE FROM firm_members WHERE id = $1 AND firm_id = $2", [memberId, firmId]);
  return { ok: (result.rowCount ?? 0) > 0 };
}

export async function countActiveFirmMembers(firmId: string): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM firm_members WHERE firm_id = $1 AND joined_at IS NOT NULL",
    [firmId]
  );
  return Number(result.rows[0]?.count ?? 0);
}
