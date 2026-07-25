"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Entity Types", href: "/#entities-anchor" },
  { label: "Pricing", href: "/#pricing-anchor" },
  { label: "How It Works", href: "/#how-anchor" },
  { label: "FAQ", href: "/#faq-anchor" },
];

export default function Nav({ isAdmin }: { isAdmin: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-[200] flex h-[68px] items-center justify-between border-b border-white/[.06] bg-navy/[.97] px-6 backdrop-blur-md md:px-12">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm font-normal text-white/65 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden rounded-lg border border-white/20 px-5 py-[9px] font-sans text-sm font-medium text-white/80 transition-all hover:bg-white/[.08] hover:text-white sm:inline-flex"
            >
              Admin
            </Link>
          )}
          <Link
            href="/auth/login"
            className="hidden rounded-lg border border-white/20 px-5 py-[9px] font-sans text-sm font-medium text-white/80 transition-all hover:bg-white/[.08] hover:text-white sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/onboard"
            className="hidden rounded-lg bg-gold px-[22px] py-[9px] font-sans text-sm font-bold text-navy shadow-[0_2px_12px_rgba(249,168,37,.35)] transition-all hover:-translate-y-px hover:bg-[#FFB300] sm:inline-flex"
          >
            Start Free →
          </Link>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex flex-col items-center justify-center gap-[5px] border-none bg-none p-2 text-white md:hidden"
          >
            <span
              className={`block h-[2px] w-[22px] rounded-sm bg-white transition-all duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`block h-[2px] w-[22px] rounded-sm bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-[2px] w-[22px] rounded-sm bg-white transition-all duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-[68px] z-[199] border-b border-white/10 bg-navy pb-4 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block w-full px-6 py-[14px] text-left font-sans text-sm text-white/80"
            >
              {link.label}
            </Link>
          ))}
          <div className="mx-6 mb-1 mt-3 flex gap-[10px] border-t border-white/10 pt-3">
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 justify-center rounded-lg border border-white/20 px-5 py-[9px] text-center font-sans text-sm font-medium text-white/80"
            >
              Sign In
            </Link>
            <Link
              href="/onboard"
              onClick={() => setMenuOpen(false)}
              className="flex-1 justify-center rounded-lg bg-gold px-[22px] py-[9px] text-center font-sans text-sm font-bold text-navy"
            >
              Start Free →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
