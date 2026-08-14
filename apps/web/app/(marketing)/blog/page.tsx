import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nonprofit Formation Blog — FormRight",
  description:
    "Guides on nonprofit compliance deadlines, IRS filings, and choosing a formation service — written for founders forming and running a 501(c)(3).",
};

const POSTS = [
  {
    href: "/blog/nonprofit-compliance-calendar",
    category: "Nonprofit Compliance",
    title: "The Complete Nonprofit Compliance Calendar",
    dek: "Every federal and state deadline a 501(c)(3) needs to track, month by month — and what happens if you miss one.",
  },
  {
    href: "/blog/form-990-n-guide",
    category: "IRS Filings",
    title: "Form 990-N (e-Postcard): The Complete Filing Guide",
    dek: "Who has to file the annual e-Postcard, what it asks for, and how to submit it — step by step.",
  },
  {
    href: "/blog/best-nonprofit-formation-service",
    category: "Comparisons",
    title: "Best Nonprofit Formation Service in 2026",
    dek: "LegalZoom vs. Nolo vs. FormRight vs. DIY, compared honestly on price and what's actually included.",
  },
  {
    href: "/blog/glossary",
    category: "Reference",
    title: "Nonprofit Formation Glossary",
    dek: "35+ plain-language definitions for the IRS, state, and governance terms every founder runs into.",
  },
];

export default function BlogIndexPage() {
  return (
    <div>
      <div className="bg-ink py-8">
        <div className="mx-auto max-w-[1000px] px-6 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-[6px] font-sans text-sm font-semibold text-white/60 transition-colors hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1000px] px-6 pb-24 pt-14 sm:px-10">
        <div className="mb-3 text-[.72rem] font-bold uppercase tracking-[.12em] text-stamp">
          Blog
        </div>
        <h1 className="mb-3 font-serif text-[2.4rem] tracking-[-.02em] text-ink">
          Nonprofit Formation Guides
        </h1>
        <p className="mb-12 max-w-[560px] font-sans text-[1.05rem] font-light leading-[1.6] text-ink-faint">
          Straight answers on compliance deadlines, IRS filings, and picking
          a formation path — written for founders forming and running a
          501(c)(3).
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {POSTS.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="block rounded-sm border border-rule bg-paper-white p-7 transition-all hover:-translate-y-[2px] hover:shadow-card"
            >
              <div className="mb-2 text-[.7rem] font-bold uppercase tracking-[.1em] text-stamp">
                {post.category}
              </div>
              <h2 className="mb-2 font-serif text-[1.3rem] leading-[1.25] text-ink">
                {post.title}
              </h2>
              <p className="text-[.88rem] font-light leading-[1.6] text-ink-faint">
                {post.dek}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
