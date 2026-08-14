import Link from "next/link";

const GUIDES = [
  {
    href: "/blog/nonprofit-compliance-calendar",
    category: "Nonprofit Compliance",
    title: "The Complete Nonprofit Compliance Calendar",
    dek: "Every federal and state deadline a 501(c)(3) needs to track, month by month.",
  },
  {
    href: "/blog/form-990-n-guide",
    category: "IRS Filings",
    title: "Form 990-N (e-Postcard): The Complete Filing Guide",
    dek: "Who has to file the annual e-Postcard, and how to submit it step by step.",
  },
  {
    href: "/blog/best-nonprofit-formation-service",
    category: "Comparisons",
    title: "Best Nonprofit Formation Service in 2026",
    dek: "LegalZoom vs. Nolo vs. FormRight vs. DIY, compared honestly.",
  },
  {
    href: "/blog/glossary",
    category: "Reference",
    title: "Nonprofit Formation Glossary",
    dek: "35+ plain-language definitions every founder runs into.",
  },
];

export default function FeaturedGuides() {
  return (
    <div id="guides-anchor" className="scroll-mt-[68px] bg-paper-white">
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:px-12">
        <div className="mb-[14px] text-[.75rem] font-bold uppercase tracking-[.12em] text-stamp">
          Guides
        </div>
        <div className="mb-[60px] flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="mb-4 max-w-[600px] font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.15] tracking-[-.02em] text-ink">
              Straight answers, before you start.
            </h2>
            <p className="max-w-[560px] text-base font-light leading-[1.75] text-ink-faint">
              Free guides on compliance deadlines, IRS filings, and choosing
              a formation path — written for founders forming a 501(c)(3).
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex shrink-0 items-center gap-[6px] font-sans text-sm font-semibold text-stamp transition-colors hover:text-stamp-dark"
          >
            View all guides →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="flex flex-col rounded-sm border border-rule bg-paper p-6 transition-all hover:-translate-y-1 hover:shadow-card-lg"
            >
              <div className="mb-2 text-[.7rem] font-bold uppercase tracking-[.1em] text-stamp">
                {guide.category}
              </div>
              <h3 className="mb-2 font-serif text-[1.05rem] leading-[1.3] text-ink">
                {guide.title}
              </h3>
              <p className="text-[.83rem] font-light leading-[1.6] text-ink-faint">
                {guide.dek}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
