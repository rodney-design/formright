import type { EntityFamily } from "./entityFamily";

export interface PricingPlan {
  key: string;
  name: string;
  priceCents: number | null; // null = custom quote
  cadence: string;
  description: string;
  features: string[];
  featured?: boolean;
  ctaLabel: string;
  ctaAction: "onboard" | "contact";
}

// Ported from the entity-tabbed pricing section of formright_v2_pbc.html
// (view-home pricing-anchor, lines ~28709-relative / source ~23486-24145).
// Replaces the flat planPrices {1:49,2:149,3:249} stub duplicated at the old
// lines 26303 and 26366 — see build-order doc note.
export const ENTITY_PRICING: Record<EntityFamily, PricingPlan[]> = {
  llc: [
    {
      key: "starter", name: "Starter", priceCents: 4900, cadence: "one-time · + state filing fee",
      description: "Documents in hand, you file. Best for single-member LLCs in simple states.",
      features: ["Articles of Organization", "Single-member Operating Agreement", "EIN application guide (SS-4)", "Document vault (5 docs)", "Step-by-step filing guide"],
      ctaLabel: "Get Started", ctaAction: "onboard",
    },
    {
      key: "standard", name: "Standard", priceCents: 14900, cadence: "one-time · + state filing fee", featured: true,
      description: "Full document package, registered agent included, and compliance reminders for the year ahead.",
      features: ["Everything in Starter", "Multi-member Operating Agreement", "Registered agent (1 year)", "Unlimited document vault", "E-signature integration", "Annual report reminders"],
      ctaLabel: "Start Formation", ctaAction: "onboard",
    },
    {
      key: "pro", name: "Pro (B2B)", priceCents: 24900, cadence: "per formation · + state filing fee",
      description: "For attorneys and accountants handling multiple LLC formations per month.",
      features: ["Everything in Standard", "White-label PDF output", "Multi-client dashboard", "Bulk formation workflow", "REST API access", "Volume pricing available"],
      ctaLabel: "Contact Sales", ctaAction: "contact",
    },
  ],
  ccorp: [
    {
      key: "starter", name: "Starter", priceCents: 9900, cadence: "one-time · + state filing fee",
      description: "All formation documents generated. You handle filing. Best for Delaware C-Corps with simple cap tables.",
      features: ["Articles of Incorporation", "Corporate Bylaws", "Stock Ledger template", "83(b) election reminder", "EIN application guide"],
      ctaLabel: "Get Started", ctaAction: "onboard",
    },
    {
      key: "standard", name: "Standard", priceCents: 24900, cadence: "one-time · + state filing fee", featured: true,
      description: "Full investor-ready package — everything a VC or angel investor expects to see at due diligence.",
      features: ["Everything in Starter", "Founder Stock Purchase Agreements", "Initial Board Resolutions", "Registered agent (1 year)", "Cap table starter template", "Unlimited document vault"],
      ctaLabel: "Start Formation", ctaAction: "onboard",
    },
    {
      key: "pro", name: "Pro (B2B)", priceCents: 39900, cadence: "per formation · + state filing fee",
      description: "For law firms and accelerators handling multiple C-Corp formations. White-label, bulk, API.",
      features: ["Everything in Standard", "White-label PDF output", "Multi-client dashboard", "Bulk formation workflow", "REST API access", "Volume pricing available"],
      ctaLabel: "Contact Sales", ctaAction: "contact",
    },
  ],
  scorp: [
    {
      key: "starter", name: "Starter", priceCents: 9900, cadence: "one-time · + state filing fee",
      description: "Articles of Incorporation, Bylaws, and IRS Form 2553 pre-filled. You file with state and IRS.",
      features: ["Articles of Incorporation", "Corporate Bylaws", "IRS Form 2553 (S-Corp election)", "Shareholder eligibility check", "EIN application guide"],
      ctaLabel: "Get Started", ctaAction: "onboard",
    },
    {
      key: "standard", name: "Standard", priceCents: 24900, cadence: "one-time · + state filing fee", featured: true,
      description: "Everything you need to operate as an S-Corp from day one, including payroll setup guidance.",
      features: ["Everything in Starter", "Stock issuance & transfer ledger", "Payroll setup guidance", "Registered agent (1 year)", "Unlimited document vault", "Annual compliance reminders"],
      ctaLabel: "Start Formation", ctaAction: "onboard",
    },
    {
      key: "pro", name: "Pro (B2B)", priceCents: 39900, cadence: "per formation · + state filing fee",
      description: "For CPAs handling S-Corp elections for business owner clients. White-label and API included.",
      features: ["Everything in Standard", "White-label PDF output", "Multi-client dashboard", "Bulk formation workflow", "REST API access", "Volume pricing available"],
      ctaLabel: "Contact Sales", ctaAction: "contact",
    },
  ],
  nonprofit: [
    {
      key: "diy", name: "DIY", priceCents: 14900, cadence: "one-time · + state filing fee",
      description: "Complete document package ready to review and file yourself. Best for organized founders comfortable with the process.",
      features: ["Articles of Incorporation", "IRS-ready Bylaws", "Conflict of Interest Policy", "Board Resolutions (8 templates)", "EIN Application (SS-4)", "1023-EZ preparation guide"],
      ctaLabel: "Get Documents", ctaAction: "onboard",
    },
    {
      key: "done-with-you", name: "Done-With-You", priceCents: 49900, cadence: "one-time · + state filing fee", featured: true,
      description: "Our team reviews your documents and files your state incorporation and EIN. You retain control of the IRS application.",
      features: ["Everything in DIY", "Document review by our team", "State incorporation filing", "EIN filing with IRS", "Whistleblower & Retention Policies", "60-day priority email support"],
      ctaLabel: "Start Formation", ctaAction: "onboard",
    },
    {
      key: "full-service-1023ez", name: "Full-Service 1023-EZ", priceCents: 119900, cadence: "one-time · + state filing fee",
      description: "We handle everything from state filing through IRS 1023-EZ submission and status tracking.",
      features: ["Everything in Done-With-You", "IRS Form 1023-EZ submission", "Pay.gov filing on your behalf", "Status tracking to approval", "Gift Acceptance Policy", "90-day email support"],
      ctaLabel: "Launch My Nonprofit", ctaAction: "onboard",
    },
    {
      key: "full-1023", name: "Full Form 1023", priceCents: null, cadence: "custom quote · + state filing fee",
      description: "For larger or more complex organizations that don't qualify for 1023-EZ. Custom narrative drafting included.",
      features: ["Full IRS Form 1023 preparation", "Activity narrative drafting", "Financial projections template", "All schedules completed", "Dedicated formation specialist", "12-month email support"],
      ctaLabel: "Book Consultation", ctaAction: "contact",
    },
  ],
  benefit: [
    {
      key: "starter", name: "Starter", priceCents: 9900, cadence: "one-time · + state filing fee",
      description: "Formation documents with benefit purpose statement. You file with state.",
      features: ["Articles of Incorporation w/ Benefit Purpose", "Corporate Bylaws", "Benefit Purpose Statement builder", "EIN application guide", "B Lab certification overview"],
      ctaLabel: "Get Started", ctaAction: "onboard",
    },
    {
      key: "standard", name: "Standard", priceCents: 24900, cadence: "one-time · + state filing fee", featured: true,
      description: "Full benefit corp package with annual report template and stakeholder impact framework.",
      features: ["Everything in Starter", "Annual Benefit Report template", "Stakeholder impact framework", "Registered agent (1 year)", "Unlimited document vault", "Annual compliance reminders"],
      ctaLabel: "Start Formation", ctaAction: "onboard",
    },
    {
      key: "pro", name: "Pro (B2B)", priceCents: 34900, cadence: "per formation · + state filing fee",
      description: "For impact firms and B Corp advisors handling multiple benefit corp formations.",
      features: ["Everything in Standard", "White-label PDF output", "Multi-client dashboard", "Bulk formation workflow", "REST API access", "Volume pricing available"],
      ctaLabel: "Contact Sales", ctaAction: "contact",
    },
  ],
  pc: [
    {
      key: "starter", name: "Starter", priceCents: 14900, cadence: "one-time · + state filing fee",
      description: "Formation documents tailored to your profession and state licensing requirements.",
      features: ["Articles of Incorporation (PC/PLLC)", "Professional Bylaws", "State licensing compliance checklist", "Profession-specific structure guide", "EIN application guide"],
      ctaLabel: "Get Started", ctaAction: "onboard",
    },
    {
      key: "standard", name: "Standard", priceCents: 29900, cadence: "one-time · + state filing fee", featured: true,
      description: "Complete professional corp package with shareholder restrictions and licensing cross-reference.",
      features: ["Everything in Starter", "Shareholder restriction provisions", "Stock Transfer Restriction Agreement", "Registered agent (1 year)", "Unlimited document vault", "License renewal reminders"],
      ctaLabel: "Start Formation", ctaAction: "onboard",
    },
    {
      key: "pro", name: "Pro (B2B)", priceCents: 44900, cadence: "per formation · + state filing fee",
      description: "For law firms and health system administrators forming multiple professional entities.",
      features: ["Everything in Standard", "White-label PDF output", "Multi-client dashboard", "Bulk formation workflow", "REST API access", "Volume pricing available"],
      ctaLabel: "Contact Sales", ctaAction: "contact",
    },
  ],
  sole: [
    {
      key: "basic", name: "Basic", priceCents: 4900, cadence: "one-time · + county/state filing fee",
      description: "DBA registration documents and a step-by-step guide to filing in your county or state. Best for freelancers just getting started.",
      features: ["DBA (Fictitious Business Name) registration", "State-specific filing instructions", "Local business license checklist", "EIN application guide", "Document vault (5 docs)"],
      ctaLabel: "Get Started", ctaAction: "onboard",
    },
    {
      key: "standard", name: "Standard", priceCents: 9900, cadence: "one-time · + county/state filing fee", featured: true,
      description: "Includes publication guidance (required in NY, CA, and others), full license checklist, and compliance reminders.",
      features: ["Everything in Basic", "Publication guidance (where required)", "State-specific permit checklist", "Renewal reminder calendar", "Unlimited document vault", "Upgrade path to LLC (credit applied)"],
      ctaLabel: "Get Started", ctaAction: "onboard",
    },
  ],
};

export interface Addon {
  key: string;
  name: string;
  priceCents: number;
  cadence: string;
  description: string;
  // True for addons billed as a real recurring Stripe subscription (Phase 2)
  // rather than a one-time checkout line item — see the `subscriptions`
  // table and POST /api/subscriptions/comply/checkout. Excluded from the
  // formation checkout's one-time line items; subscribed to separately from
  // the dashboard after formation.
  recurring?: boolean;
}

// Ported from the shared "Add-Ons & Annual Compliance" section.
export const ADDONS: Addon[] = [
  { key: "comply", name: "FormRight Comply", priceCents: 14900, cadence: "/yr", description: "Compliance calendar · Document vault · Deadline alerts · Annual report reminders", recurring: true },
  { key: "registered_agent", name: "Registered Agent", priceCents: 9900, cadence: "/yr", description: "Add-on for entry-level plans · All states" },
  { key: "expedited_filing", name: "Expedited Filing", priceCents: 7900, cadence: "one-time", description: "Rush processing · Priority handling" },
  { key: "pro_compliance", name: "Pro Compliance", priceCents: 4900, cadence: "/client/yr", description: "B2B · Per client · Annual" },
];

export function getPlansForEntity(family: EntityFamily): PricingPlan[] {
  return ENTITY_PRICING[family] || ENTITY_PRICING.llc;
}

export function getPlan(family: EntityFamily, planKey: string): PricingPlan | undefined {
  return getPlansForEntity(family).find((p) => p.key === planKey);
}

// FormRight Pro per-seat billing (System 4 — B2B API hardening). Previously
// this had no default at all: /api/subscriptions/pro/checkout 500'd until a
// human set FIRM_SEAT_PRICE_CENTS, deliberately, because no verified
// per-seat number existed. $29.99/mo/seat is a real default now so the
// endpoint works out of the box — override via env for the actual go-to-market
// price once that's decided.
export const FIRM_SEAT_PRICE_CENTS = parseInt(
  process.env.FIRM_SEAT_PRICE_CENTS || "2999",
  10
);
