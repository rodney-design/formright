import { NextResponse } from "next/server";
import { requireFirmAdmin } from "@/lib/queries/firms";
import { revokeApiKey } from "@/lib/queries/apiKeys";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  let admin;
  try {
    admin = await requireFirmAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const revoked = await revokeApiKey(params.id, admin.membership.firm.id);
  if (!revoked) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
