const STEPS = [
  {
    num: "01",
    icon: "📝",
    iconBg: "bg-teal-pale",
    title: "Answer guided questions",
    description:
      "We walk you through mission, board structure, programs, and compliance basics — in plain English. No legal expertise needed.",
  },
  {
    num: "02",
    icon: "⚡",
    iconBg: "bg-yellow-pale",
    title: "Generate all your documents",
    description:
      "Articles of Incorporation, Bylaws, Conflict of Interest Policy, Board Resolutions, EIN forms, and IRS 1023-EZ drafts — instantly.",
  },
  {
    num: "03",
    icon: "🚀",
    iconBg: "bg-[#d1fae5]",
    title: "File with confidence",
    description:
      "Choose DIY, Done-With-You, or Full-Service formation. We handle the paperwork so you can focus on impact.",
  },
];

export default function HowItWorks() {
  return (
    <div id="how-anchor" className="scroll-mt-[68px] bg-white">
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:px-12">
        <div className="mb-[14px] text-[.75rem] font-bold uppercase tracking-[.12em] text-teal">
          Process
        </div>
        <h2 className="mb-4 max-w-[700px] font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.15] tracking-[-.02em] text-navy">
          From idea to incorporated in three steps.
        </h2>
        <p className="max-w-[560px] text-base font-light leading-[1.75] text-slate-500">
          We&apos;ve simplified a complex process into a clear, guided workflow
          anyone can complete — for any entity type.
        </p>

        <div className="mt-[60px] grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-brand-lg border border-slate-200 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-lg"
            >
              <div className="mb-5 font-serif text-[3.5rem] font-bold leading-none text-slate-100">
                {step.num}
              </div>
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] text-xl ${step.iconBg}`}
              >
                {step.icon}
              </div>
              <h3 className="mb-[10px] text-[1.05rem] font-semibold text-navy">
                {step.title}
              </h3>
              <p className="text-[.875rem] font-light leading-[1.7] text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
