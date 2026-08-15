import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Support — FormRight",
};

export default function SupportPage() {
  return (
    <LegalShell
      tag="Help Center"
      title="Support"
      dateLine="Knowledge base & client resources"
      notice={
        <>
          Find answers to common questions below. Can&apos;t find what you
          need? Our team is one email away at{" "}
          <strong>
            <a href="mailto:support@formright.org">support@formright.org</a>
          </strong>
          .
        </>
      }
      maxWidth="900px"
    >
      {/* Quick links */}
      <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/contact"
          className="flex items-center gap-[14px] rounded-sm bg-stamp px-6 py-5 text-paper-white"
        >
          <span className="text-2xl">✉️</span>
          <div>
            <div className="mb-[2px] font-bold">Email Support</div>
            <div className="text-[.83rem] opacity-85">support@formright.org</div>
          </div>
        </Link>
        <a
          href="mailto:support@formright.org"
          className="flex items-center gap-[14px] rounded-sm bg-ink px-6 py-5 text-paper-white"
        >
          <span className="text-2xl">📞</span>
          <div>
            <div className="mb-[2px] font-bold">Book a Call</div>
            <div className="text-[.83rem] opacity-65">Mon–Fri, 9am–5pm ET</div>
          </div>
        </a>
      </div>

      <h2>Frequently Asked Questions</h2>

      <h3>Getting Started</h3>

      <p>
        <strong>What exactly does FormRight do?</strong>
        <br />
        FormRight prepares the legal formation documents your business needs
        — Articles of Incorporation/Organization, Bylaws/Operating
        Agreements, IRS forms, and more — for all 7 major U.S. entity types.
        Depending on your plan, we can also file directly with your state and
        the IRS on your behalf.
      </p>

      <p>
        <strong>What entity types does FormRight support?</strong>
        <br />
        FormRight v2.0 supports LLCs, C-Corporations, S-Corporations,
        Nonprofits (501c3), Sole Proprietorships, Benefit Corporations, and
        Professional Corporations (PC/PLLC) across all 50 states and
        Washington D.C.
      </p>

      <p>
        <strong>Is FormRight a law firm?</strong>
        <br />
        No. FormRight is a document preparation and filing assistance
        service. We do not provide legal advice or representation. For
        complex legal questions, we recommend consulting a licensed
        attorney.
      </p>

      <p>
        <strong>How long does the formation process take?</strong>
        <br />
        Document generation is instant after you complete the onboarding
        form. State incorporation typically takes 1–4 weeks depending on the
        state and entity type. IRS 1023-EZ approval averages 2–4 weeks; full
        Form 1023 applications can take 3–6 months.
      </p>

      <p>
        <strong>Which states do you serve?</strong>
        <br />
        FormRight supports formation in all 50 U.S. states and D.C.
        State-specific requirements are incorporated into your documents
        automatically for every entity type.
      </p>

      <h3>Documents &amp; Downloads</h3>

      <p>
        <strong>How do I access my documents?</strong>
        <br />
        After completing your intake form and payment, your documents are
        available immediately in your dashboard under the &quot;Documents&quot;
        tab. Each file can be downloaded individually or as a single ZIP
        bundle.
      </p>

      <p>
        <strong>Can I edit the documents after downloading?</strong>
        <br />
        Yes — all documents are delivered as editable .docx files. We
        recommend reviewing every document with your board before signing or
        submitting. If you find an error caused by our platform, contact us
        and we&apos;ll correct it at no charge.
      </p>

      <p>
        <strong>What&apos;s included in the document pack?</strong>
        <br />
        All plans include: Articles of Incorporation, Bylaws, Conflict of
        Interest Policy, Board Meeting Minutes, EIN Application Guide
        (SS-4), Whistleblower Policy, Document Retention Policy, Gift
        Acceptance Policy, and Board Resolution Templates.
      </p>

      <h3>IRS &amp; Tax Exemption</h3>

      <p>
        <strong>What&apos;s the difference between Form 1023 and 1023-EZ?</strong>
        <br />
        Form 1023-EZ is a simplified application for smaller organizations
        (projected annual gross receipts under $50,000 and total assets
        under $250,000). The full Form 1023 is required for larger or more
        complex organizations. FormRight&apos;s IRS screening step will
        recommend the right form for your situation.
      </p>

      <p>
        <strong>Does FormRight guarantee IRS approval?</strong>
        <br />
        No. IRS determination outcomes are solely within the agency&apos;s
        discretion and are affected by factors outside our control. What we
        do guarantee is that your application will be complete, accurate,
        and properly structured based on your information.
      </p>

      <p>
        <strong>What if the IRS asks for more information?</strong>
        <br />
        If the IRS issues a request for additional information (sometimes
        called a &quot;deficiency letter&quot;), contact us at{" "}
        <strong>
          <a href="mailto:support@formright.org">support@formright.org</a>
        </strong>
        . Depending on your plan, we may assist with the response at no
        additional charge or at a reduced rate.
      </p>

      <h3>Billing &amp; Account</h3>

      <p>
        <strong>What payment methods do you accept?</strong>
        <br />
        We accept all major credit and debit cards (Visa, Mastercard,
        American Express, Discover) processed securely through Stripe. We do
        not store card information on our servers.
      </p>

      <p>
        <strong>Can I upgrade my plan after purchase?</strong>
        <br />
        Yes. Contact{" "}
        <strong>
          <a href="mailto:billing@formright.org">billing@formright.org</a>
        </strong>{" "}
        and we&apos;ll apply your original payment as a credit toward the
        upgraded plan. You only pay the difference.
      </p>

      <p>
        <strong>How do I request a refund?</strong>
        <br />
        See our <Link href="/refund">Refund Policy</Link> for full details.
        To initiate a refund, email{" "}
        <strong>
          <a href="mailto:billing@formright.org">billing@formright.org</a>
        </strong>{" "}
        with your name, order ID, and reason.
      </p>

      <h2 className="mt-12">Still need help?</h2>
      <p>
        Our support team is available Monday–Friday, 9am–5pm ET. We aim to
        respond to all emails within 1 business day.
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:support@formright.org">support@formright.org</a>
        <br />
        <strong>Phone:</strong> (800) 555-0190
        <br />
        <strong>Mailing:</strong> FormRight, PBC, 1234 Purpose Ave Suite 100,
        Wilmington, DE 19801
      </p>
    </LegalShell>
  );
}
