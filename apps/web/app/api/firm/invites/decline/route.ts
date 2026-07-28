import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { declineFirmInvite } from "@/lib/queries/firms";

export const runtime = "nodejs";

const schema = z.object({ firmId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const declined = await declineFirmInvite(user.id, parsed.data.firmId);
  if (!declined) return NextResponse.json({ error: "No pending invite found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
