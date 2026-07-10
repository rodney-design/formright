import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "About FormRight",
};

export default function AboutPage() {
  return (
    <LegalShell
      tag="Company"
      title="About FormRight"
      dateLine={<>Founded 2024 &nbsp;·&nbsp; Wilmington, Delaware &nbsp;·&nbsp; v2.0</>}
      notice="FormRight exists because starting any business — a nonprofit, an LLC, a C-Corp — shouldn't require a law degree or a $5,000 retainer. We built the platform we wished existed."
    >
      <h2>Our Mission</h2>
      <p>
        FormRight&apos;s mission is to democratize business formation —
        making it fast, affordable, and accurate for every type of founder in
        America. Whether you&apos;re launching a startup, a small business, a
        social enterprise, or a nonprofit that&apos;s out to change the
        world, FormRight guides you through every step with intelligence,
        accuracy, and plain-language clarity.
      </p>

      <h2>From Nonprofit-Only to Every Founder (v2.0)</h2>
      <p>
        FormRight was built originally for nonprofit founders — that&apos;s
        our heritage and our differentiator. Across the United States, more
        than 30 million small businesses incorporate each year. The same
        friction that plagued nonprofit founders — confusing forms,
        inconsistent state requirements, opaque filing processes — affects
        every one of them.
      </p>
      <p>
        FormRight v2.0 responds to this reality. The platform now supports
        all 7 major U.S. business entity types: LLCs, C-Corporations,
        S-Corporations, Nonprofits (501c3), Sole Proprietorships, Benefit
        Corporations, and Professional Corporations. Our nonprofit expertise
        is preserved and deepened — it becomes a signal of rigor, care, and
        quality that differentiates the platform from generic competitors.
      </p>

      <h2>What We Do</h2>
      <p>
        We are a document preparation and filing assistance platform — not a
        law firm. FormRight automates the creation of state-specific
        formation documents, prepares IRS applications, and provides
        step-by-step guidance through the entire process. Our 50-state + D.C.
        requirements database is updated quarterly, and our document accuracy
        rate exceeds 99.5%.
      </p>

      <h2>Our Team</h2>
      <p>
        FormRight was founded by a team of former attorneys, compliance
        professionals, and civic technologists who saw firsthand how broken
        the formation process was for founders of every kind. We are a fully
        remote team headquartered in Wilmington, Delaware, with team members
        across the United States.
      </p>

      <h2>Our Values</h2>
      <p><strong>Clarity.</strong> Every legal term is explained inline — no jargon without context.</p>
      <p><strong>Accuracy.</strong> Our documents are built on real legal expertise and reviewed against current IRS guidance and state requirements.</p>
      <p><strong>Accessibility.</strong> We price our services so that founder-led organizations — not just well-funded ones — can get started properly. Starting at $49.</p>
      <p><strong>Integrity.</strong> We are clear about what we are (a document preparation service) and what we are not (a law firm).</p>

      <h2>Not a Law Firm</h2>
      <div className="legal-warning">
        FormRight is a document preparation service, not a law firm. We do
        not provide legal advice or representation. For complex legal
        matters, we recommend consulting a licensed attorney in your state.
      </div>

      <h2>Get In Touch</h2>
      <p>
        We&apos;d love to hear from you. Reach us at{" "}
        <strong>
          <a href="mailto:hello@rightform.org">hello@rightform.org</a>
        </strong>{" "}
        or visit our <Link href="/contact">Contact page</Link> for more ways
        to connect.
      </p>
    </LegalShell>
  );
}
