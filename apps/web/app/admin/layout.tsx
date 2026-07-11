import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  if (user.role !== "admin" && user.role !== "super_admin") {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-serif font-bold text-navy mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your account ({user.email}) doesn&apos;t have admin access.
        </p>
        <Link href="/dashboard" className="text-teal font-semibold text-sm">
          Go to my dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy text-white px-8 py-4 flex items-center justify-between">
        <div className="font-serif font-bold">
          Form<span className="text-gold">Right</span>{" "}
          <span className="text-xs font-sans font-normal text-white/50 ml-2">Admin</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/60">{user.email}</span>
          <Link href="/admin" className="text-white/60 hover:text-white">
            Pipeline
          </Link>
          <Link href="/admin/firms" className="text-white/60 hover:text-white">
            Pro Firms
          </Link>
          <Link href="/" className="text-white/60 hover:text-white">
            ← Exit Admin
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button className="text-white/60 hover:text-white" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="p-6 md:p-10 max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
