import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

const createFirmSchema = z.object({
  name: z.string().min(1),
  adminEmail: z.string().email(),
  adminName: z.string().optional().default(""),
});

// Firm creation is a staff-initiated action, not self-serve — the pricing
// page routes Pro-tier signups to "Contact Sales" (brief §4.3), not Stripe
// Checkout. This is that sales-assisted onboarding step: an internal admin
// creates the firm and its first admin after the sales conversation
// concludes. The founding admin's joined_at is set immediately (no separate
// invite-acceptance step) since staff are directly provisioning them.
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createFirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, adminEmail, adminName } = parsed.data;

  const firmResult = await query<{ id: string }>("INSERT INTO firms (name) VALUES ($1) RETURNING id", [name]);
  const firmId = firmResult.rows[0].id;

  // BUG (fixed): same check-then-insert race on users.email already fixed
  // elsewhere (lib/auth.ts, api/checkout, api/v1/formations) — two admins
  // creating a firm for the same brand-new admin email at once (or one
  // admin double-clicking) could both see "not found" and both attempt
  // INSERT, the loser throwing an uncaught unique-violation.
  const upsertedUser = await query<{ id: string }>(
    `INSERT INTO users (email, name) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET email = users.email
     RETURNING id`,
    [adminEmail, adminName || null]
  );
  const userId = upsertedUser.rows[0].id;

  await query(
    `INSERT INTO firm_members (firm_id, user_id, role, invited_at, joined_at)
     VALUES ($1, $2, 'firm_admin', now(), now())`,
    [firmId, userId]
  );

  return NextResponse.json({ firmId }, { status: 201 });
}
