const FEATURES = [
  {
    icon: "🗺",
    title: "State-specific documents",
    description:
      "Every form is tailored to your state's incorporation requirements — not generic templates.",
  },
  {
    icon: "⚖️",
    title: "Expert-level compliance",
    description:
      "Our system is built on real nonprofit governance expertise, ensuring IRS and state accuracy.",
  },
  {
    icon: "💬",
    title: "No legal jargon",
    description:
      "Clear guidance written for mission-driven founders, not attorneys or accountants.",
  },
  {
    icon: "📊",
    title: "Status dashboard",
    description:
      "Track every filing milestone from incorporation to IRS approval in one place.",
  },
  {
    icon: "🔔",
    title: "Compliance reminders",
    description:
      "Annual reporting, board meetings, and renewal deadlines — we keep you on track.",
  },
  {
    icon: "🤝",
    title: "Expert support",
    description:
      "Our team is available for Done-With-You and Full-Service clients throughout the process.",
  },
];

export default function Features() {
  return (
    <section className="bg-ink px-6 py-24 md:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-[14px] text-[.75rem] font-bold uppercase tracking-[.12em] text-brass-light">
          Why FormRight
        </div>
        <h2 className="max-w-[700px] font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.15] tracking-[-.02em] text-paper-white">
          Built for every founder with a purpose.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-sm border border-white/[.08] bg-white/[.04] p-7 transition-colors hover:border-brass/30 hover:bg-white/[.07]"
            >
              <div className="mb-4 text-[28px]">{feature.icon}</div>
              <h3 className="mb-2 text-[.95rem] font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-[.825rem] font-light leading-[1.7] text-white/45">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
