import Link from "next/link";
import Logo from "./Logo";

const FORMATION_LINKS = [
  "LLC Formation",
  "C-Corp Formation",
  "S-Corp Formation",
  "Nonprofit 501(c)(3)",
  "Benefit Corp",
  "Professional Corp",
];

const ENTITY_TAGS = [
  { label: "LLC", border: "border-[#00897B]/25", text: "text-[#4DB6AC]" },
  { label: "C-Corp", border: "border-[#7C3AED]/25", text: "text-[#A78BFA]" },
  { label: "S-Corp", border: "border-[#F9A825]/25", text: "text-gold" },
  { label: "Nonprofit", border: "border-[#0EA5E9]/25", text: "text-[#38BDF8]" },
  { label: "Sole Prop", border: "border-white/15", text: "text-white/40" },
  { label: "Benefit Corp", border: "border-[#16A34A]/25", text: "text-[#4ADE80]" },
  { label: "Prof Corp", border: "border-[#6366F1]/25", text: "text-[#818CF8]" },
];

export default function Footer({ isAdmin }: { isAdmin: boolean }) {
  return (
    <footer className="bg-navy px-6 pb-8 pt-16 md:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid grid-cols-1 gap-12 border-b border-white/[.08] pb-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo linked={false} />
            <p className="mt-[14px] max-w-[260px] text-[.85rem] font-light leading-[1.75] text-white/40">
              Business Formation for Every Founder. LLCs · C-Corps · S-Corps ·
              Nonprofits · Sole Props · Benefit Corps · Professional Corps
            </p>
            <div className="mt-4 border-t border-white/[.08] pt-4">
              <p className="mb-[6px] text-[.72rem] font-bold tracking-[.03em] text-teal-light">
                FormRight, PBC — A Delaware Public Benefit Corporation
              </p>
              <p className="text-[.72rem] font-light leading-[1.75] text-white/35">
                Our benefit purpose: to make business formation accessible,
                accurate, and affordable for every founder — with particular
                commitment to nonprofit and mission-driven organizations.
              </p>
            </div>
            <div className="mt-[14px] flex flex-wrap gap-[6px]">
              {ENTITY_TAGS.map((tag) => (
                <span
                  key={tag.label}
                  className={`rounded-full border px-[9px] py-[2px] text-[.7rem] font-semibold ${tag.border} ${tag.text}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-[.75rem] font-bold uppercase tracking-[.1em] text-white/40">
              Formation
            </h4>
            {FORMATION_LINKS.map((label) => (
              <Link
                key={label}
                href="/onboard"
                className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="mb-4 text-[.75rem] font-bold uppercase tracking-[.1em] text-white/40">
              Platform
            </h4>
            <Link href="/#how-anchor" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              How It Works
            </Link>
            <Link href="/#pricing-anchor" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              Pricing
            </Link>
            <Link href="/auth/login" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              Sign In
            </Link>
            <Link href="/terms" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/refund" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              Refund Policy
            </Link>
          </div>

          <div>
            <h4 className="mb-4 text-[.75rem] font-bold uppercase tracking-[.1em] text-white/40">
              Company
            </h4>
            <Link href="/about" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              About FormRight
            </Link>
            <Link href="/contact" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              Contact Us
            </Link>
            <Link href="/#faq-anchor" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              FAQ
            </Link>
            <Link href="/support" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              Support
            </Link>
            <Link href="/disclaimer" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
              Disclaimer
            </Link>
            {isAdmin && (
              <Link href="/admin" className="mb-[10px] block font-sans text-[.875rem] text-white/60 transition-colors hover:text-white">
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 pt-6 text-[.78rem] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © 2026 FormRight, PBC. All rights reserved. · A Delaware Public
            Benefit Corporation.
          </span>
          <span>
            Not a law firm · Document preparation service · Business
            Formation for Every Founder
          </span>
        </div>
      </div>
    </footer>
  );
}
