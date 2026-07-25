"use client";

import { useState } from "react";
import Link from "next/link";
import type { EntityFamily } from "@/lib/entities/entityFamily";
import { ENTITY_PRICING, ADDONS, type PricingPlan } from "@/lib/entities/pricing";

interface FamilyTabConfig {
  key: EntityFamily;
  icon: string;
  label: string;
  accent: string;
  tagline: string;
  description: string;
  badge?: string;
  notice?: { title: string; body: string; theme: "blue" | "orange" };
}

const FAMILIES: FamilyTabConfig[] = [
  {
    key: "llc",
    icon: "🏢",
    label: "LLC",
    accent: "#00897B",
    tagline: "LLC Formation",
    description:
      "The most popular business structure in the U.S. FormRight generates your Articles of Organization, Operating Agreement, and EIN guidance — tailored to your state.",
  },
  {
    key: "ccorp",
    icon: "🚀",
    label: "C-Corp",
    accent: "#7C3AED",
    tagline: "C-Corporation Formation",
    description:
      "Built for VC-backed startups. Delaware defaults, Articles of Incorporation, Bylaws, Stock Ledger, 83(b) election reminder, and an investor-ready document package.",
  },
  {
    key: "scorp",
    icon: "💼",
    label: "S-Corp",
    accent: "#F57F17",
    tagline: "S-Corporation Formation",
    description:
      "Pass-through taxation without self-employment tax on distributions. Includes IRS Form 2553 (S-Corp election) preparation and shareholder eligibility confirmation.",
  },
  {
    key: "nonprofit",
    icon: "🌱",
    label: "Nonprofit",
    accent: "#0EA5E9",
    tagline: "Nonprofit 501(c)(3) Formation",
    description:
      "Our most comprehensive product — and our heritage. From state incorporation through IRS tax-exempt status. Every tier includes our full governance document package.",
    badge: "🏅 Nonprofit Specialist — Heritage-Built",
    notice: {
      title: "Not sure if you qualify for 1023-EZ?",
      body: "Organizations with projected annual gross receipts under $50,000 and total assets under $250,000 typically qualify. Our IRS Screening step (Step 5) will recommend the right form for your situation — no guesswork.",
      theme: "blue",
    },
  },
  {
    key: "benefit",
    icon: "🌍",
    label: "Benefit Corp",
    accent: "#16A34A",
    tagline: "Benefit Corporation Formation",
    description:
      "Mission-driven for-profits with legal accountability to social purpose. Includes benefit purpose statement builder, B Lab certification guidance, and annual benefit report template.",
  },
  {
    key: "pc",
    icon: "⚖️",
    label: "Prof Corp",
    accent: "#6366F1",
    tagline: "Professional Corporation Formation",
    description:
      "For licensed professionals: physicians, attorneys, CPAs, architects, engineers. Includes state professional licensing compliance checks and structure guidance specific to your profession.",
  },
  {
    key: "sole",
    icon: "👤",
    label: "Sole Prop",
    accent: "#F97316",
    tagline: "Sole Proprietorship / DBA Registration",
    description:
      "The simplest way to start. No formal entity required — just register your trade name and get your local licenses in order. FormRight walks you through it state by state.",
    notice: {
      title: "Thinking of growing into an LLC?",
      body: "Many founders start as a sole proprietor and upgrade later. FormRight applies your Standard plan fee as a credit toward an LLC formation when you're ready to make the jump.",
      theme: "orange",
    },
  },
];

function formatPrice(priceCents: number | null): string {
  if (priceCents === null) return "Custom";
  return `$${(priceCents / 100).toLocaleString("en-US")}`;
}

function PlanCard({ plan, accent }: { plan: PricingPlan; accent: string }) {
  const href = plan.ctaAction === "contact" ? "/contact" : "/onboard";

  if (plan.featured) {
    return (
      <div className="relative rounded-sm border-2 border-stamp bg-ink p-8 text-paper-white">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-stamp px-[14px] py-1 text-[.72rem] font-bold uppercase tracking-[.05em] text-paper-white">
          Most Popular
        </span>
        <div className="mb-3 text-[.78rem] font-bold uppercase tracking-[.1em] text-brass-light">
          {plan.name}
        </div>
        <div className="font-serif text-[2.8rem] font-bold leading-none text-paper-white">
          <span className="align-super text-[1.2rem] font-normal text-white/50">$</span>
          {formatPrice(plan.priceCents).replace("$", "")}
        </div>
        <div className="mb-5 mt-[6px] text-[.8rem] font-light text-white/50">{plan.cadence}</div>
        <p className="mb-5 text-[.85rem] font-light leading-[1.6] text-white/50">{plan.description}</p>
        <div className="my-5 h-px bg-white/10" />
        <ul className="mb-7 flex flex-col gap-[10px]">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[.825rem] leading-[1.5] text-white/70">
              <span className="mt-[1px] shrink-0 text-success">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className="block w-full rounded bg-stamp px-4 py-[13px] text-center font-sans text-[.9rem] font-bold text-paper-white"
        >
          {plan.ctaLabel} →
        </Link>
      </div>
    );
  }

  const isContact = plan.ctaAction === "contact";

  return (
    <div className="relative rounded-sm border-2 border-rule bg-paper-white p-8 transition-all hover:-translate-y-1 hover:border-stamp hover:shadow-card-lg">
      <div className="mb-3 text-[.78rem] font-bold uppercase tracking-[.1em]" style={{ color: accent }}>
        {plan.name}
      </div>
      {plan.priceCents === null ? (
        <div className="font-serif text-[2rem] font-bold leading-none text-ink">Custom Quote</div>
      ) : (
        <div className="font-serif text-[2.8rem] font-bold leading-none text-ink">
          <span className="align-super text-[1.2rem] font-normal text-ink-faint">$</span>
          {formatPrice(plan.priceCents).replace("$", "")}
        </div>
      )}
      <div className="mb-5 mt-[6px] text-[.8rem] font-light text-ink-faint">{plan.cadence}</div>
      <p className="mb-5 text-[.85rem] font-light leading-[1.6] text-ink-faint">{plan.description}</p>
      <div className="my-5 h-px bg-rule" />
      <ul className="mb-7 flex flex-col gap-[10px]">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[.825rem] leading-[1.5] text-ink">
            <span className="mt-[1px] shrink-0 text-success">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="block w-full rounded px-4 py-[13px] text-center font-sans text-[.9rem] font-bold transition-colors"
        style={
          isContact
            ? { backgroundColor: "#14213D", color: "white" }
            : { backgroundColor: "transparent", border: `2px solid ${accent}`, color: accent }
        }
      >
        {plan.ctaLabel} →
      </Link>
    </div>
  );
}

export default function PricingTabs() {
  const [activeTab, setActiveTab] = useState<EntityFamily>("llc");
  const family = FAMILIES.find((f) => f.key === activeTab)!;
  const plans = ENTITY_PRICING[activeTab];

  const gridColsClass =
    plans.length >= 4
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      : plans.length === 2
        ? "grid-cols-1 sm:grid-cols-2 max-w-[720px]"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="pricing-anchor" className="scroll-mt-[68px] bg-paper-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-[1140px]">
        <div className="mb-[14px] text-[.75rem] font-bold uppercase tracking-[.12em] text-stamp">
          Pricing
        </div>
        <h2 className="mb-4 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.15] tracking-[-.02em] text-ink">
          Pricing by entity type.
        </h2>
        <p className="max-w-[560px] text-base font-light leading-[1.75] text-ink-faint">
          Every entity is different — so is the work. FormRight prices each
          product based on complexity, documents, and the expertise required.
          All prices are FormRight service fees plus your state&apos;s filing
          fee.
        </p>

        {/* PBC Pricing Commitment */}
        <div className="mt-7 flex flex-wrap items-center gap-[14px] rounded-sm border border-rule bg-paper px-5 py-[14px]">
          <span className="shrink-0 text-lg text-stamp">✓</span>
          <p className="text-[.83rem] leading-[1.65] text-ink">
            <strong className="text-stamp">No billing surprises.</strong> Annual
            subscriptions renew at the price shown — we email you 30 days
            before every renewal. Cancel anytime directly from your
            dashboard. No phone call, no hoops. That&apos;s a promise.
          </p>
          <span className="ml-auto shrink-0 whitespace-nowrap text-[.7rem] font-bold tracking-[.03em] text-stamp">
            FormRight, PBC
          </span>
        </div>

        {/* Entity Type Tabs */}
        <div className="mt-10 flex flex-wrap gap-2 border-b-2 border-rule">
          {FAMILIES.map((f) => {
            const isActive = f.key === activeTab;
            return (
              <button
                key={f.key}
                onClick={() => setActiveTab(f.key)}
                className={`-mb-[2px] flex items-center gap-[7px] rounded-t-md border-b-[3px] px-[18px] py-[10px] font-sans text-[.875rem] transition-colors ${
                  isActive
                    ? "border-stamp font-semibold text-stamp"
                    : "border-transparent font-medium text-ink-faint hover:text-ink"
                }`}
              >
                {f.icon} {f.label}
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        <div className="pt-9">
          <div className="mb-6 flex flex-wrap items-center gap-[14px]">
            <div>
              <div className="mb-1 text-[.8rem] font-semibold" style={{ color: family.accent }}>
                {family.tagline}
              </div>
              <p className="max-w-[600px] text-[.875rem] text-ink-faint">{family.description}</p>
            </div>
            {family.badge && (
              <div className="shrink-0 whitespace-nowrap rounded-[10px] border border-[#0EA5E9]/20 bg-[#0EA5E9]/[.08] px-4 py-[10px] text-[.8rem] font-semibold text-[#0284C7]">
                {family.badge}
              </div>
            )}
          </div>

          <div className={`grid gap-5 ${gridColsClass}`}>
            {plans.map((plan) => (
              <PlanCard key={plan.key} plan={plan} accent={family.accent} />
            ))}
          </div>

          {family.notice && (
            <div
              className={`mt-5 rounded-xl border px-5 py-4 text-[.825rem] leading-[1.7] ${
                family.notice.theme === "blue"
                  ? "border-sky-200 bg-sky-50 text-sky-800"
                  : "border-orange-200 bg-orange-50 text-orange-900"
              }`}
            >
              <strong>{family.notice.title}</strong> {family.notice.body}
            </div>
          )}
        </div>

        {/* Add-ons (shared across all tabs) */}
        <div className="mt-10 rounded-sm border border-rule bg-paper p-8">
          <div className="mb-5 text-[.85rem] font-bold uppercase tracking-[.1em] text-ink-faint">
            Add-Ons &amp; Annual Compliance — All Entity Types
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ADDONS.map((addon) =>
              addon.key === "comply" ? (
                <div
                  key={addon.key}
                  className="relative flex items-center justify-between gap-3 rounded-sm border-2 border-stamp bg-paper-white p-5"
                >
                  <span className="absolute -top-[10px] left-4 rounded-full bg-stamp px-[10px] py-[3px] text-[.72rem] font-bold text-paper-white">
                    MOST POPULAR
                  </span>
                  <div>
                    <div className="text-[.875rem] font-medium text-ink">{addon.name}</div>
                    <div className="text-[.7rem] text-ink-faint">{addon.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-[1.2rem] font-semibold text-stamp">
                      {formatPrice(addon.priceCents)}
                    </div>
                    <div className="text-[.7rem] text-ink-faint">{addon.cadence}</div>
                  </div>
                </div>
              ) : (
                <div
                  key={addon.key}
                  className="flex items-center justify-between gap-3 rounded-sm border border-rule bg-paper-white p-5"
                >
                  <div>
                    <div className="text-[.875rem] font-medium text-ink">{addon.name}</div>
                    <div className="text-[.7rem] text-ink-faint">{addon.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-[1.2rem] font-semibold text-ink">
                      {formatPrice(addon.priceCents)}
                    </div>
                    <div className="text-[.7rem] text-ink-faint">{addon.cadence}</div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
