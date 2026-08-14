"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Entity Types", href: "/#entities-anchor" },
  { label: "Pricing", href: "/#pricing-anchor" },
  { label: "How It Works", href: "/#how-anchor" },
  { label: "FAQ", href: "/#faq-anchor" },
  { label: "Blog", href: "/blog" },
  { label: "Glossary", href: "/blog/glossary" },
];

export default function Nav({ isAdmin }: { isAdmin: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-[200] flex h-[68px] items-center justify-between border-b border-rule bg-paper-white/[.92] px-6 backdrop-blur-md md:px-12">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm font-normal text-ink-faint transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden rounded border border-ink/20 px-5 py-[9px] font-sans text-sm font-medium text-ink-faint transition-all hover:bg-ink/[.05] hover:text-ink sm:inline-flex"
            >
              Admin
            </Link>
          )}
          <Link
            href="/auth/login"
            className="hidden rounded border border-ink/20 px-5 py-[9px] font-sans text-sm font-medium text-ink-faint transition-all hover:bg-ink/[.05] hover:text-ink sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/onboard"
            className="hidden rounded bg-stamp px-[22px] py-[9px] font-sans text-sm font-bold text-paper-white transition-all hover:-translate-y-px hover:bg-stamp-dark sm:inline-flex"
          >
            Start Free →
          </Link>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex flex-col items-center justify-center gap-[5px] border-none bg-none p-2 text-ink md:hidden"
          >
            <span
              className={`block h-[2px] w-[22px] rounded-sm bg-ink transition-all duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`block h-[2px] w-[22px] rounded-sm bg-ink transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-[2px] w-[22px] rounded-sm bg-ink transition-all duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-[68px] z-[199] border-b border-rule bg-paper-white pb-4 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block w-full px-6 py-[14px] text-left font-sans text-sm text-ink-faint"
            >
              {link.label}
            </Link>
          ))}
          <div className="mx-6 mb-1 mt-3 flex gap-[10px] border-t border-rule pt-3">
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 justify-center rounded border border-ink/20 px-5 py-[9px] text-center font-sans text-sm font-medium text-ink-faint"
            >
              Sign In
            </Link>
            <Link
              href="/onboard"
              onClick={() => setMenuOpen(false)}
              className="flex-1 justify-center rounded bg-stamp px-[22px] py-[9px] text-center font-sans text-sm font-bold text-paper-white"
            >
              Start Free →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
