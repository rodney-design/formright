"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/firm", icon: "🏢", label: "Clients" },
  { href: "/firm/members", icon: "👥", label: "Team" },
  { href: "/firm/api-keys", icon: "🔑", label: "API Keys" },
  { href: "/firm/billing", icon: "💳", label: "Billing" },
  { href: "/firm/settings", icon: "🎨", label: "Branding" },
];

export default function FirmNav({ firmName, email }: { firmName: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-navy text-white p-6 hidden md:flex md:flex-col">
      <div className="font-serif font-bold text-lg mb-1">
        Form<span className="text-gold">Right</span>{" "}
        <span className="text-xs font-sans font-normal text-white/50 ml-1">Pro</span>
      </div>
      <div className="text-sm font-semibold truncate mt-2">{firmName}</div>
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
      <Link href="/dashboard" className="text-xs text-white/40 hover:text-white/70 mb-2">
        ← My personal dashboard
      </Link>
      <form action="/api/auth/logout" method="POST">
        <button className="text-xs text-white/40 hover:text-white/70 text-left" type="submit">
          Sign out
        </button>
      </form>
    </aside>
  );
}
