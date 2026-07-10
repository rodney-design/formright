"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Is FormRight a law firm?",
    a: "No. FormRight is a document preparation and filing assistance service. We do not provide legal advice and no attorney-client relationship is created by using our platform. For legal advice specific to your situation, we recommend consulting a licensed attorney.",
  },
  {
    q: "What entity types does FormRight v2.0 support?",
    a: "FormRight v2.0 supports LLCs, C-Corporations, S-Corporations, Nonprofits (501c3), Sole Proprietorships, Benefit Corporations, and Professional Corporations (PC/PLLC) across all 50 states and Washington D.C.",
  },
  {
    q: "How long does the formation process take?",
    a: "Document generation is instant. State filing typically takes 1–4 weeks depending on your state and entity type. For nonprofits, IRS 1023-EZ approval averages 2–4 weeks. Full 1023 applications can take 3–6 months. We provide real-time status updates throughout.",
  },
  {
    q: "Do you cover all 50 states?",
    a: "Yes. FormRight generates state-specific formation documents for all 50 states and Washington D.C., automatically tailored to each state's requirements for every entity type.",
  },
  {
    q: 'What makes FormRight\'s nonprofit support "best-in-class"?',
    a: "FormRight was built originally for nonprofit founders — it's our heritage. Our nonprofit path includes a full IRS 1023 and 1023-EZ application flow, mission statement builder, state charitable registration guidance, donor acknowledgment letter templates, and governance documents (bylaws, conflict of interest policy, board resolutions) all included. No generic competitor can match this depth.",
  },
  {
    q: "What's the difference between the Starter, Standard, and Pro plans?",
    a: "Starter ($49) covers document generation and filing guidance — ideal for DIY founders. Standard ($149) adds registered agent service, unlimited document vault, e-signature, and priority support — our most popular plan. Pro ($249) is built for attorneys and accountants with multi-client dashboards, white-label PDFs, bulk workflows, and API access.",
  },
  {
    q: "What if I already have an EIN?",
    a: "No problem — you can enter your existing EIN during the intake questionnaire. We'll skip the EIN application step and use your existing number for all other filings and documents.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. FormRight uses AES-256 encryption at rest for all vault documents and TLS 1.3 for all data in transit. No PII is stored in application logs. We are GDPR and CCPA compliant from launch with a privacy-by-design architecture, targeting SOC 2 Type II certification in Year 1.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div id="faq-anchor" className="scroll-mt-[68px] bg-white">
      <div className="mx-auto max-w-[800px] px-6 py-24 md:px-12">
        <div className="mb-12 text-center">
          <div className="mb-[14px] text-[.75rem] font-bold uppercase tracking-[.12em] text-teal">
            FAQ
          </div>
          <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.15] tracking-[-.02em] text-navy">
            Common questions.
          </h2>
        </div>

        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.q} className="border-b border-slate-200 py-6">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 border-none bg-none text-left font-sans text-base font-semibold text-navy"
              >
                {faq.q}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-pale text-base text-teal transition-transform ${isOpen ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="mt-[14px] text-[.875rem] font-light leading-[1.8] text-slate-500">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
