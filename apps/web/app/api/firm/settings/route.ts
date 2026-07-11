import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { requireFirmAdmin } from "@/lib/queries/firms";

export const runtime = "nodejs";

const settingsSchema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.string().url().or(z.literal("")).optional(),
  primaryColor: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color without the #")
    .or(z.literal(""))
    .optional(),
});

export async function PATCH(req: NextRequest) {
  let admin;
  try {
    admin = await requireFirmAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, logoUrl, primaryColor } = parsed.data;

  if (name !== undefined) {
    await query("UPDATE firms SET name = $1 WHERE id = $2", [name, admin.membership.firm.id]);
  }
  if (logoUrl !== undefined || primaryColor !== undefined) {
    const currentBranding = admin.membership.firm.branding ?? {};
    const nextBranding = {
      ...currentBranding,
      ...(logoUrl !== undefined ? { logoUrl: logoUrl || undefined } : {}),
      ...(primaryColor !== undefined ? { primaryColor: primaryColor || undefined } : {}),
    };
    await query("UPDATE firms SET branding = $1 WHERE id = $2", [
      JSON.stringify(nextBranding),
      admin.membership.firm.id,
    ]);
  }

  return NextResponse.json({ ok: true });
}
