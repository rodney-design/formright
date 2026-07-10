import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLinkToken, createSession } from "@/lib/auth";

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

  const dest = user.role === "admin" || user.role === "super_admin" ? "/admin" : "/dashboard";
  return NextResponse.redirect(`${appUrl}${dest}`);
}
