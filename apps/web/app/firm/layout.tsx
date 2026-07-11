import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFirmMembershipForUser } from "@/lib/queries/firms";
import FirmNav from "@/components/firm/FirmNav";

export default async function FirmLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const membership = await getFirmMembershipForUser(user.id);
  if (!membership) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-serif font-bold text-navy mb-2">No Firm Access</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your account ({user.email}) isn&apos;t a member of a FormRight Pro firm. Contact your firm
          admin for an invite, or reach out to sales for the B2B Pro tier.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FirmNav firmName={membership.firm.name} email={user.email} />
      <main className="flex-1 p-6 md:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
