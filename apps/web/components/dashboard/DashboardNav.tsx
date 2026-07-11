"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Overview" },
  { href: "/dashboard/documents", icon: "📄", label: "Documents" },
  { href: "/dashboard/filing-status", icon: "📊", label: "Filing Status" },
  { href: "/dashboard/billing", icon: "💳", label: "Billing" },
  { href: "/dashboard/assistant", icon: "💬", label: "Assistant" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
];

export default function DashboardNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-navy text-white p-6 hidden md:flex md:flex-col">
      <div className="font-serif font-bold text-lg mb-1">
        Form<span className="text-gold">Right</span>
      </div>
      <div className="text-xs text-white/50 mb-8 truncate">{email}</div>
      <nav className="flex flex-col gap-1 flex-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-white/10 font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action="/api/auth/logout" method="POST">
        <button className="text-xs text-white/40 hover:text-white/70 text-left" type="submit">
          Sign out
        </button>
      </form>
    </aside>
  );
}
