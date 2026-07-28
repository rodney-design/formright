import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPendingFirmInvitesForUser } from "@/lib/queries/firms";
import FirmInviteResponse from "@/components/firm/FirmInviteResponse";

// Lives outside app/firm/ deliberately — that layout requires an *accepted*
// membership (getFirmMembershipForUser), which a pending invite isn't yet.
export default async function FirmInvitePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [invite] = await getPendingFirmInvitesForUser(user.id);
  if (!invite) redirect("/dashboard");

  return <FirmInviteResponse firmId={invite.firm.id} firmName={invite.firm.name} />;
}
