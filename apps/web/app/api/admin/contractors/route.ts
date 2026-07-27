import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createContractorForEmail } from "@/lib/queries/contractors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const statesCovered: string[] = Array.isArray(body.statesCovered)
    ? body.statesCovered.filter((s: unknown) => typeof s === "string")
    : [];

  const contractor = await createContractorForEmail(
    body.email,
    typeof body.name === "string" ? body.name : undefined,
    statesCovered
  );

  return NextResponse.json({ contractor });
}
