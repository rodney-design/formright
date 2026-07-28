import { NextResponse } from "next/server";
import { requireFirmAdmin, removeFirmMember } from "@/lib/queries/firms";
import { syncFirmSeatQuantity } from "@/lib/queries/firmSubscriptions";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  let admin;
  try {
    admin = await requireFirmAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await removeFirmMember(params.id, admin.membership.firm.id);
  if (!result.ok) {
    if (result.error === "last_admin") {
      return NextResponse.json(
        { error: "Can't remove the last admin — promote another member to admin first." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await syncFirmSeatQuantity(admin.membership.firm.id);
  return NextResponse.json({ ok: true });
}
