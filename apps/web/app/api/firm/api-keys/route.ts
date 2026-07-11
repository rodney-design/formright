import { NextResponse } from "next/server";
import { requireFirmAdmin, requireFirmMembership } from "@/lib/queries/firms";
import { createApiKey, listApiKeysForFirm } from "@/lib/queries/apiKeys";

export const runtime = "nodejs";

export async function GET() {
  let membership;
  try {
    ({ membership } = await requireFirmMembership());
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const keys = await listApiKeysForFirm(membership.firm.id);
  return NextResponse.json({ keys });
}

export async function POST() {
  let admin;
  try {
    admin = await requireFirmAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, rawKey } = await createApiKey(admin.membership.firm.id);
  return NextResponse.json({ id, key: rawKey });
}
