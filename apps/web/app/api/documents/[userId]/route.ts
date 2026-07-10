import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getVaultDocumentsForUser } from "@/lib/queries/documents";

export const runtime = "nodejs";

// Document vault API (build-order doc §Phase 2 step 3): returns pre-signed
// S3 URLs for a user's already-generated documents. Callers get documents
// straight from generation via /api/documents/registration/:registrationId.
export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  if (!isAdmin && user.id !== params.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const documents = await getVaultDocumentsForUser(params.userId);
  return NextResponse.json({ documents });
}
