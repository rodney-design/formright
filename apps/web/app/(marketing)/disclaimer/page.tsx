import type { Metadata } from "next";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Legal Disclaimer — FormRight",
};

export default function DisclaimerPage() {
  return (
    <LegalShell
      tag="Legal"
      title="Legal Disclaimer"
      dateLine={
        <>Effective Date: January 1, 2026 &nbsp;·&nbsp; Last Updated: March 1, 2026</>
      }
      notice="Please read this disclaimer carefully before using FormRight. It defines the nature and limits of our services."
      noticeVariant="warning"
    >
      <h2>Not a Law Firm</h2>
      <p>
        FormRight is <strong>not a law firm</strong> and does not employ
        attorneys in a legal advisory capacity for clients. FormRight
        provides document preparation, filing assistance, and compliance
        education services only.
      </p>
      <p>
        <strong>No attorney-client relationship</strong> is created between
        FormRight and any user by virtue of using this platform, submitting
        information, making a payment, or communicating with FormRight staff
        or support.
      </p>

      <h2>No Legal Advice</h2>
      <p>
        The information, documents, templates, guidance, and content
        provided through the FormRight platform do not constitute legal
        advice and should not be relied upon as such. Nothing on this
        platform creates an attorney-client relationship or should be
        treated as a substitute for consultation with a qualified, licensed
        nonprofit attorney in your jurisdiction.
      </p>
      <p>
        If you require legal advice regarding your organization&apos;s
        structure, governance, tax-exempt eligibility, compliance
        obligations, employment matters, or any other legal question, you
        should consult a licensed attorney.
      </p>

      <h2>No Tax Advice</h2>
      <p>
        FormRight does not provide tax advice. Information provided through
        our platform about IRS forms, tax-exempt status, or fiscal matters is
        general and informational in nature. For tax guidance specific to
        your nonprofit, consult a licensed CPA or tax attorney.
      </p>

      <h2>Document Accuracy</h2>
      <p>
        While FormRight strives to ensure that all document templates and
        workflows are current and accurate, we make no representations or
        warranties that:
      </p>
      <ul>
        <li>Documents generated will be accepted by any state agency or the IRS</li>
        <li>Information about filing requirements reflects the most current state or federal law</li>
        <li>The platform is free from errors, omissions, or outdated content</li>
      </ul>
      <p>
        Users are solely responsible for reviewing all generated documents
        before signing or submitting them. FormRight strongly recommends
        having all documents reviewed by a qualified attorney prior to
        filing.
      </p>

      <h2>Filing Outcomes</h2>
      <p>
        FormRight makes no guarantees regarding the outcome of any state or
        federal filing. State incorporation approvals, EIN assignments, and
        IRS tax-exempt determinations are made at the sole discretion of the
        relevant government agency. Processing times, approval rates, and
        requirements are subject to change without notice.
      </p>

      <h2>Third-Party Information</h2>
      <p>
        Any references to third-party resources, government websites, or
        external organizations are provided for informational purposes only.
        FormRight does not endorse and is not responsible for the accuracy of
        third-party content.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by applicable law, FormRight
        disclaims all liability for any loss, damage, cost, or expense —
        whether direct, indirect, incidental, or consequential — arising
        from your reliance on information or documents provided through the
        Service.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this disclaimer may be directed to{" "}
        <strong>
          <a href="mailto:legal@formright.org">legal@formright.org</a>
        </strong>
        .
      </p>
    </LegalShell>
  );
}
