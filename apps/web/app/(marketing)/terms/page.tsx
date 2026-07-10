import type { Metadata } from "next";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — FormRight",
};

export default function TermsPage() {
  return (
    <LegalShell
      tag="Legal"
      title="Terms of Service"
      dateLine={
        <>Effective Date: January 1, 2026 &nbsp;·&nbsp; Last Updated: March 1, 2026</>
      }
      notice="FormRight is a document preparation and filing assistance service — not a law firm. These terms govern your use of our platform and services."
    >
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the FormRight platform (&quot;Service&quot;), you agree
        to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree
        to these Terms, do not use the Service. These Terms apply to all
        users, including visitors, registered users, and paying clients.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        FormRight provides an automated document preparation platform that
        assists individuals and organizations with preparing nonprofit
        formation documents, including but not limited to:
      </p>
      <ul>
        <li>Articles of Incorporation (state-specific)</li>
        <li>Organizational Bylaws</li>
        <li>Conflict of Interest Policies</li>
        <li>Initial Board Meeting Minutes</li>
        <li>IRS Form SS-4 (EIN Application)</li>
        <li>IRS Form 1023-EZ and 1023 drafts</li>
      </ul>
      <p>
        Depending on the service tier selected, FormRight may also submit
        filings on behalf of clients to state agencies and the IRS. FormRight
        does not provide legal advice, tax advice, or representation before
        any court or government agency.
      </p>

      <h2>3. Not a Law Firm</h2>
      <div className="legal-warning">
        FormRight is not a law firm and does not practice law. No
        attorney-client relationship is formed by using this Service. The
        information and documents provided are for general informational and
        preparation purposes only and do not constitute legal advice.
      </div>
      <p>
        We strongly recommend consulting a licensed nonprofit attorney for
        matters specific to your legal situation, especially for complex
        tax-exempt status applications, governance disputes, or
        state-specific compliance issues.
      </p>

      <h2>4. User Responsibilities</h2>
      <p>You are solely responsible for:</p>
      <ul>
        <li>The accuracy and completeness of all information you provide to FormRight</li>
        <li>Reviewing all generated documents before submission to any government agency</li>
        <li>Ensuring your organization meets all state and federal requirements for nonprofit status</li>
        <li>Timely submission of all required annual reports, renewals, and filings</li>
        <li>Maintaining accurate records in compliance with applicable law</li>
      </ul>
      <p>
        FormRight is not responsible for rejected filings, delays, or adverse
        outcomes resulting from inaccurate information provided by the user,
        changes in law, or agency processing times beyond our control.
      </p>

      <h2>5. Accounts and Registration</h2>
      <p>
        To access the Service, you must create an account with a valid email
        address and password. You are responsible for maintaining the
        confidentiality of your login credentials and for all activity that
        occurs under your account. You agree to notify FormRight immediately
        of any unauthorized use of your account.
      </p>

      <h2>6. Payment and Fees</h2>
      <p>
        Service fees are disclosed at the time of purchase and are due in
        full before document generation or filing services are initiated.
        All payments are processed securely through Stripe. Fees do not
        include third-party government filing fees, which are the sole
        responsibility of the client unless expressly stated in the selected
        plan.
      </p>
      <p>
        FormRight reserves the right to modify pricing at any time. Changes
        will not affect orders already placed and paid.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All content on the FormRight platform, including templates,
        workflows, software, and branding, is the intellectual property of
        FormRight and is protected by applicable copyright and trademark
        laws. You may not reproduce, distribute, or create derivative works
        without express written permission.
      </p>
      <p>
        Documents generated on your behalf using your submitted information
        are yours to use for their intended nonprofit formation purpose.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, FormRight and its officers,
        employees, and affiliates shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising from
        your use of the Service, including but not limited to: IRS rejection
        of applications, state filing rejections, loss of tax-exempt status,
        or reliance on documents prepared by the platform.
      </p>
      <p>
        Our total liability to you for any claim arising from use of the
        Service shall not exceed the total fees paid by you to FormRight in
        the 12 months preceding the claim.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of Delaware,
        without regard to conflict of law principles. Any disputes shall be
        resolved through binding arbitration in accordance with the American
        Arbitration Association rules, except where prohibited by law.
      </p>

      <h2>10. Changes to Terms</h2>
      <p>
        FormRight reserves the right to update these Terms at any time. We
        will notify registered users of material changes via email or
        platform notice. Continued use of the Service after changes
        constitutes acceptance of the updated Terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        For questions about these Terms, contact us at{" "}
        <strong>
          <a href="mailto:legal@rightform.org">legal@rightform.org</a>
        </strong>{" "}
        or write to: FormRight Legal, 1234 Purpose Ave, Suite 100, Wilmington,
        DE 19801.
      </p>
    </LegalShell>
  );
}
