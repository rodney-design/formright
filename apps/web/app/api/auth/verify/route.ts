import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLinkToken, createSession } from "@/lib/auth";
import { getFirmMembershipForUser, getPendingFirmInvitesForUser } from "@/lib/queries/firms";

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

  // Firm invites no longer auto-join on login (see lib/queries/firms.ts) — a
  // firm admin inviting an arbitrary email shouldn't be able to add someone
  // to the firm, and its Stripe seat count, just because that person signed
  // in for an unrelated reason. Route them to the explicit accept/decline
  // page instead.
  let dest = "/dashboard";
  if (user.role === "admin" || user.role === "super_admin") {
    dest = "/admin";
  } else if (await getFirmMembershipForUser(user.id)) {
    dest = "/firm";
  } else if ((await getPendingFirmInvitesForUser(user.id)).length > 0) {
    dest = "/firm-invite";
  }
  return NextResponse.redirect(`${appUrl}${dest}`);
}
