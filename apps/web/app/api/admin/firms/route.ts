import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { withTransaction } from "@/lib/db";

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

  // Firm insert -> user find-or-create -> membership insert used to be three
  // separate top-level queries; a failure partway through (e.g. the
  // membership insert) orphaned a firms row with no admin attached. Wrapped
  // in one transaction so it's all-or-nothing.
  const firmId = await withTransaction(async (tx) => {
    const firmResult = await tx.query<{ id: string }>("INSERT INTO firms (name) VALUES ($1) RETURNING id", [name]);
    const firmId = firmResult.rows[0].id;

    const existingUser = await tx.query<{ id: string }>("SELECT id FROM users WHERE email = $1", [adminEmail]);
    let userId: string;
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
    } else {
      const inserted = await tx.query<{ id: string }>(
        "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id",
        [adminEmail, adminName || null]
      );
      userId = inserted.rows[0].id;
    }

    await tx.query(
      `INSERT INTO firm_members (firm_id, user_id, role, invited_at, joined_at)
       VALUES ($1, $2, 'firm_admin', now(), now())`,
      [firmId, userId]
    );

    return firmId;
  });

  return NextResponse.json({ firmId }, { status: 201 });
}
