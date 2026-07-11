import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLinkToken, createSession } from "@/lib/auth";
import { acceptPendingFirmInvites, getFirmMembershipForUser } from "@/lib/queries/firms";
import { syncFirmSeatQuantity } from "@/lib/queries/firmSubscriptions";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=missing_token`);
  }

  const user = await consumeMagicLinkToken(token);
  if (!user) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=invalid_token`);
  }

  await createSession(user.id);
  const joinedFirmIds = await acceptPendingFirmInvites(user.id);
  await Promise.all(joinedFirmIds.map((firmId) => syncFirmSeatQuantity(firmId)));

  let dest = "/dashboard";
  if (user.role === "admin" || user.role === "super_admin") {
    dest = "/admin";
  } else if (await getFirmMembershipForUser(user.id)) {
    dest = "/firm";
  }
  return NextResponse.redirect(`${appUrl}${dest}`);
}
