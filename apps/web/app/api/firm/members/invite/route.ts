import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireFirmAdmin } from "@/lib/queries/firms";
import { sendFirmInviteEmail } from "@/lib/email";

export const runtime = "nodejs";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["firm_admin", "firm_member"]).default("firm_member"),
});

// Client invitation/handoff flow (build-order doc §Phase 4 step 5): invite by
// email -> firm_members row created in pending state -> accepted on login.
// The "accepted on login" half lives in /api/auth/verify/route.ts.
export async function POST(req: NextRequest) {
  let admin;
  try {
    admin = await requireFirmAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const { email, role } = parsed.data;

  // BUG (fixed): same check-then-insert race on users.email already fixed
  // elsewhere (lib/auth.ts, api/checkout, api/v1/formations) — two firm
  // admins inviting the same brand-new email at once (or one admin
  // double-clicking) could both see "not found" and both attempt INSERT,
  // the loser throwing an uncaught unique-violation.
  const upsertedUser = await query<{ id: string }>(
    `INSERT INTO users (email) VALUES ($1)
     ON CONFLICT (email) DO UPDATE SET email = users.email
     RETURNING id`,
    [email]
  );
  const userId = upsertedUser.rows[0].id;

  const existingMembership = await query(
    "SELECT id FROM firm_members WHERE firm_id = $1 AND user_id = $2",
    [admin.membership.firm.id, userId]
  );
  if (existingMembership.rows.length > 0) {
    return NextResponse.json({ error: "This person is already on the team" }, { status: 400 });
  }

  await query(
    `INSERT INTO firm_members (firm_id, user_id, role, invited_at)
     VALUES ($1, $2, $3, now())`,
    [admin.membership.firm.id, userId, role]
  );

  await sendFirmInviteEmail(email, admin.membership.firm.name, admin.user.email);

  return NextResponse.json({ ok: true });
}
