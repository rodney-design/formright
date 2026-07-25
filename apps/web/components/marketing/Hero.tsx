import Link from "next/link";

const ENTITY_TABS = [
  "LLC",
  "C-Corp",
  "S-Corp",
  "Nonprofit 501(c)(3)",
  "Sole Proprietorship",
  "Benefit Corp",
  "Professional Corp",
];

const DOC_FIELDS = [
  { label: "ENTITY NAME", value: "Bright Futures Collective, Inc." },
  { label: "STATE OF FORMATION", value: "Delaware" },
  { label: "ENTITY TYPE", value: "Nonprofit Corporation" },
  { label: "REGISTERED AGENT", value: "On file" },
];

function FilingSeal() {
  return (
    <svg
      viewBox="0 0 160 160"
      className="animate-stamp absolute -right-6 -top-8 h-32 w-32 mix-blend-multiply sm:h-40 sm:w-40"
      style={{ transformOrigin: "60% 55%" }}
      aria-hidden="true"
    >
      <defs>
        <path id="sealArcTop" d="M 20,80 A 60,60 0 0 1 140,80" />
      </defs>
      <circle cx="80" cy="80" r="70" fill="none" stroke="#A8351D" strokeWidth="2.5" opacity="0.85" />
      <circle cx="80" cy="80" r="59" fill="none" stroke="#A8351D" strokeWidth="1.2" opacity="0.7" />
      <text fill="#A8351D" fontSize="12.5" fontWeight="700" letterSpacing="2.5" opacity="0.85">
        <textPath href="#sealArcTop" startOffset="50%" textAnchor="middle">
          FORMRIGHT · FILED ·
        </textPath>
      </text>
      <path
        d="M52 84 L71 103 L110 60"
        fill="none"
        stroke="#A8351D"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <text
        x="80"
        y="128"
        textAnchor="middle"
        fill="#A8351D"
        fontSize="10"
        fontWeight="700"
        letterSpacing="1.5"
        opacity="0.8"
      >
        APPROVED
      </text>
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper px-6 py-[88px] md:px-12">
      <div className="bg-ledger pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div>
          <div className="mb-6 flex items-center gap-3 font-sans text-[.78rem] font-bold uppercase tracking-[.14em] text-stamp">
            <span className="h-px w-8 bg-stamp/40" />
            Form No. FR-2.0 — All Entity Types Live
          </div>
          <h1 className="mb-6 font-serif text-[clamp(2.6rem,5vw,4rem)] leading-[1.08] tracking-[-.02em] text-ink">
            Business formation for <em className="text-stamp not-italic italic">every founder.</em>
          </h1>
          <p className="mb-9 max-w-[480px] text-[1.05rem] font-light leading-[1.75] text-ink-faint">
            From LLCs to nonprofits, C-Corps to Benefit Corporations —
            FormRight guides you through every step of U.S. business
            formation, and hands you back a real, state-accepted filing.
          </p>

          <div className="mb-9 flex flex-wrap gap-x-4 gap-y-[6px] border-y border-rule py-4 font-mono text-[.72rem] uppercase tracking-[.06em] text-ink-faint">
            {ENTITY_TABS.map((label, i) => (
              <span key={label} className="flex items-center gap-4">
                {label}
                {i < ENTITY_TABS.length - 1 && <span className="text-rule">/</span>}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 rounded bg-stamp px-9 py-[15px] font-sans text-base font-bold text-paper-white transition-all hover:-translate-y-0.5 hover:bg-stamp-dark"
            >
              Start Your Formation →
            </Link>
            <Link
              href="/#pricing-anchor"
              className="inline-flex items-center gap-2 rounded border-2 border-ink/20 px-[34px] py-[13px] font-sans text-base font-semibold text-ink-faint transition-all hover:border-ink/40 hover:text-ink"
            >
              See Pricing
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[420px] pt-6">
          <div
            className="relative rounded-sm border border-ink/15 bg-paper-white p-8 shadow-[0_20px_60px_rgba(20,33,61,.14)]"
            style={{ transform: "rotate(1.4deg)" }}
          >
            <FilingSeal />
            <div className="mb-5 border-b border-rule pb-4">
              <div className="font-mono text-[.68rem] uppercase tracking-[.14em] text-ink-faint">
                State of Delaware · Division of Corporations
              </div>
              <h2 className="mt-2 font-serif text-[1.35rem] leading-tight text-ink">
                Articles of Incorporation
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {DOC_FIELDS.map((field) => (
                <div key={field.label}>
                  <div className="font-mono text-[.65rem] uppercase tracking-[.1em] text-ink-faint">
                    {field.label}
                  </div>
                  <div className="mt-[3px] border-b border-dotted border-rule pb-[6px] text-[.9rem] text-ink">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 text-center font-mono text-[.7rem] uppercase tracking-[.08em] text-ink-faint">
            Real documents. Not just a form.
          </p>
        </div>
      </div>
    </section>
  );
}
