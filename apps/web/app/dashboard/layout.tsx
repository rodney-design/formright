import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav email={user.email} />
      <main className="flex-1 p-6 md:p-10 max-w-5xl">{children}</main>
    </div>
  );
}
