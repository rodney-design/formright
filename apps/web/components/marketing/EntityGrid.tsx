import Link from "next/link";

interface EntityCard {
  icon: string;
  label: string;
  accent: string; // hex
  title: string;
  description: string;
  forms: string;
  note?: string;
}

const ENTITIES: EntityCard[] = [
  {
    icon: "🏢",
    label: "LLC",
    accent: "#00897B",
    title: "Limited Liability Company",
    description:
      "The most flexible U.S. entity. Ideal for freelancers, small businesses, real estate, and startups seeking simplicity with liability protection.",
    forms: "Articles of Organization, Operating Agreement, EIN",
  },
  {
    icon: "🚀",
    label: "C-Corp",
    accent: "#7C3AED",
    title: "C-Corporation",
    description:
      "Built for venture-backed startups. Delaware defaults, investor-ready document package, 83(b) election reminder, and cap table starter.",
    forms: "Articles of Incorporation, Bylaws, Stock Ledger, 83(b)",
  },
  {
    icon: "💼",
    label: "S-Corp",
    accent: "#F9A825",
    title: "S-Corporation",
    description:
      "Pass-through taxation without self-employment tax on distributions. Best for profitable small business owners optimizing their tax structure.",
    forms: "Articles of Incorporation, Bylaws, IRS Form 2553",
  },
  {
    icon: "🌱",
    label: "Nonprofit",
    accent: "#0EA5E9",
    title: "Nonprofit 501(c)(3)",
    description:
      "Our heritage. Best-in-class support for charitable organizations, foundations, educational and religious entities. Full 1023/1023-EZ flow included.",
    forms: "Articles of Incorporation, Bylaws, Form 1023/1023-EZ",
  },
  {
    icon: "👤",
    label: "Sole Prop",
    accent: "#F97316",
    title: "Sole Proprietorship",
    description:
      "The simplest structure for independent contractors and freelancers, with DBA registration guidance and local business license assistance.",
    forms: "DBA Registration, Local Business License Guidance",
  },
  {
    icon: "🌍",
    label: "Benefit",
    accent: "#16A34A",
    title: "Benefit Corporation",
    description:
      "Mission-driven for-profits with legal accountability to social purpose. Includes benefit purpose statement builder and B Lab certification guidance.",
    forms: "Articles with Benefit Statement, Annual Benefit Report",
    note: "✓ FormRight is itself a Public Benefit Corporation — we know this structure from the inside.",
  },
  {
    icon: "⚖️",
    label: "Prof Corp",
    accent: "#6366F1",
    title: "Professional Corporation (PC/PLLC)",
    description:
      "For licensed professionals: doctors, lawyers, accountants, architects. Includes state professional licensing compliance guidance.",
    forms: "Articles of Incorporation, Professional Licensing Compliance",
  },
];

export default function EntityGrid() {
  return (
    <div id="entities-anchor" className="scroll-mt-[68px] bg-slate-50 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-[14px] text-[.75rem] font-bold uppercase tracking-[.12em] text-teal">
          What We Support
        </div>
        <h2 className="mb-4 max-w-[700px] font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.15] tracking-[-.02em] text-navy">
          Every U.S. Business Entity Type
        </h2>
        <p className="max-w-[560px] text-base font-light leading-[1.75] text-slate-500">
          FormRight v2.0 covers the full spectrum — 7 entity types, all 50
          states. Our nonprofit heritage is a differentiator, not a
          constraint.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENTITIES.map((entity) => (
            <Link
              key={entity.label}
              href="/onboard"
              className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-card-lg"
              style={{ borderTopWidth: 4, borderTopColor: entity.accent }}
            >
              <div className="mb-3 text-[26px]">{entity.icon}</div>
              <div
                className="mb-[10px] inline-block w-fit rounded px-2 py-[2px] text-[.68rem] font-bold uppercase tracking-[.1em]"
                style={{ color: entity.accent, backgroundColor: `${entity.accent}14` }}
              >
                {entity.label}
              </div>
              <h3 className="mb-[6px] text-[.975rem] font-bold text-navy">
                {entity.title}
              </h3>
              <p className="mb-[10px] text-[.8rem] font-light leading-[1.7] text-slate-500">
                {entity.description}
              </p>
              <div className="mt-auto text-[.72rem] text-slate-400">
                Key forms: <strong className="text-slate-600">{entity.forms}</strong>
              </div>
              {entity.note && (
                <div
                  className="mt-[10px] border-t pt-[10px] text-[.75rem] italic"
                  style={{ borderColor: `${entity.accent}1F`, color: entity.accent }}
                >
                  {entity.note}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
