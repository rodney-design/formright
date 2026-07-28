import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { getRegistrationById } from "@/lib/queries/registrations";

const STATUS_VALUES = ["pending", "paid", "in_review", "filed", "complete", "payment_failed"] as const;

const patchSchema = z.object({
  status: z.enum(STATUS_VALUES).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { status, notes } = parsed.data;
  if (status === undefined && notes === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // BUG (fixed): this used to run the UPDATE(s) and always respond {ok:true}
  // regardless of whether params.id matched a real row — a mistyped or
  // stale registration ID silently updated zero rows and still looked like
  // a success to the admin UI.
  const existing = await getRegistrationById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (status !== undefined) {
    await query("UPDATE registrations SET status = $1 WHERE id = $2", [status, params.id]);
  }
  if (notes !== undefined) {
    await query("UPDATE registrations SET notes = $1 WHERE id = $2", [notes, params.id]);
  }

  return NextResponse.json({ ok: true });
}
