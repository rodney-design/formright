import Link from "next/link";

const ENTITY_PILLS = [
  { label: "LLC", bg: "bg-[#00897B]/10", border: "border-[#00897B]/25", text: "text-[#4DB6AC]" },
  { label: "C-Corp", bg: "bg-[#7C3AED]/10", border: "border-[#7C3AED]/25", text: "text-[#A78BFA]" },
  { label: "S-Corp", bg: "bg-[#F9A825]/10", border: "border-[#F9A825]/25", text: "text-gold" },
  { label: "Nonprofit 501(c)(3)", bg: "bg-[#0EA5E9]/10", border: "border-[#0EA5E9]/25", text: "text-[#38BDF8]" },
  { label: "Sole Proprietorship", bg: "bg-[#F97316]/10", border: "border-[#F97316]/25", text: "text-[#FB923C]" },
  { label: "Benefit Corp", bg: "bg-[#16A34A]/10", border: "border-[#16A34A]/25", text: "text-[#4ADE80]" },
  { label: "Professional Corp", bg: "bg-[#6366F1]/10", border: "border-[#6366F1]/25", text: "text-[#818CF8]" },
];

const DOC_ITEMS = [
  { icon: "📄", iconBg: "bg-[#1B9AAA]/20", name: "Articles of Incorporation", sub: "State-specific · Customized", status: "Ready" },
  { icon: "📋", iconBg: "bg-[#F2C94C]/15", name: "IRS-Ready Bylaws", sub: "Governance compliant", status: "Ready" },
  { icon: "🤝", iconBg: "bg-[#10B981]/15", name: "Conflict of Interest Policy", sub: "Board approved template", status: "Ready" },
  { icon: "🏦", iconBg: "bg-[#8B5CF6]/15", name: "EIN Application (SS-4)", sub: "Federal filing", status: "Generating" },
  { icon: "🔖", iconBg: "bg-[#EF4444]/[.12]", name: "IRS Form 1023-EZ Draft", sub: "Tax-exempt status", status: "Generating" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-navy px-6 py-[100px] md:px-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 90% at 75% 50%, rgba(0,137,123,.13) 0%, transparent 65%)," +
            "radial-gradient(ellipse 50% 70% at 5% 90%, rgba(249,168,37,.08) 0%, transparent 60%)," +
            "radial-gradient(ellipse 40% 50% at 50% 0%, rgba(124,58,237,.07) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[.12] px-4 py-[6px] text-[.78rem] font-semibold uppercase tracking-[.08em] text-gold">
            <span className="mr-1 inline-block h-[7px] w-[7px] animate-pulse rounded-full bg-gold" />
            v2.0 — All Entity Types Now Live
          </div>
          <h1 className="mb-6 font-serif text-[clamp(2.8rem,5vw,4.2rem)] leading-[1.1] tracking-[-.02em] text-white">
            Business Formation for <em className="italic text-teal-light">Every Founder.</em>
          </h1>
          <p className="mb-10 text-[1.1rem] font-light leading-[1.75] text-white/60">
            From LLCs to Nonprofits, C-Corps to Benefit Corporations — FormRight
            guides you through every step of U.S. business formation with
            intelligence, accuracy, and plain-language clarity.
          </p>
          <div className="mb-8 flex flex-wrap gap-[7px]">
            {ENTITY_PILLS.map((pill) => (
              <span
                key={pill.label}
                className={`rounded-full border px-[11px] py-1 text-[.72rem] font-semibold ${pill.bg} ${pill.border} ${pill.text}`}
              >
                {pill.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 rounded-brand bg-gold px-9 py-[15px] font-sans text-base font-bold text-navy shadow-gold transition-all hover:-translate-y-0.5 hover:bg-[#FFB300]"
            >
              Start Your Formation →
            </Link>
            <Link
              href="/#pricing-anchor"
              className="inline-flex items-center gap-2 rounded-brand border-2 border-white/20 px-[34px] py-[13px] font-sans text-base font-semibold text-white/70 transition-all hover:bg-teal-pale hover:text-navy"
            >
              See Pricing
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-[.82rem] text-white/50">
              <span className="text-gold">✓</span> All 50 states + D.C.
            </div>
            <div className="flex items-center gap-2 text-[.82rem] text-white/50">
              <span className="text-gold">✓</span> 7 entity types
            </div>
            <div className="flex items-center gap-2 text-[.82rem] text-white/50">
              <span className="text-gold">✓</span> No legal jargon
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[.08] bg-white/[.04] p-8 backdrop-blur-sm">
          <div className="mb-4 text-[.7rem] font-bold uppercase tracking-[.1em] text-white/30">
            Documents Generated
          </div>
          <div className="flex flex-col gap-3">
            {DOC_ITEMS.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center gap-[14px] rounded-[10px] border border-white/10 bg-white/[.06] px-[18px] py-[14px]"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${doc.iconBg}`}>
                  {doc.icon}
                </div>
                <div className="flex-1">
                  <div className="text-[.85rem] font-medium text-white">{doc.name}</div>
                  <div className="mt-[2px] text-[.75rem] text-white/40">{doc.sub}</div>
                </div>
                <span
                  className={`rounded-full px-[9px] py-[3px] text-[.72rem] font-semibold ${
                    doc.status === "Ready"
                      ? "bg-[#10B981]/20 text-[#34D399]"
                      : "bg-[#F2C94C]/20 text-[#F2C94C]"
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
