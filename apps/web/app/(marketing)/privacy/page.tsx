import type { Metadata } from "next";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — FormRight",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      tag="Legal"
      title="Privacy Policy"
      dateLine={
        <>Effective Date: January 1, 2026 &nbsp;·&nbsp; Last Updated: March 1, 2026</>
      }
      notice="Your privacy is important to us. This policy explains what data we collect, how we use it, and your rights as a user."
    >
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, including:</p>
      <ul>
        <li><strong>Account information:</strong> Name, email address, password (hashed)</li>
        <li><strong>Organization information:</strong> Nonprofit name, mission, state of incorporation, EIN, board member names and contact details, address</li>
        <li><strong>Payment information:</strong> Processed securely via Stripe. FormRight does not store full credit card numbers.</li>
        <li><strong>Usage data:</strong> Pages visited, features used, browser type, IP address, and session data collected via cookies and analytics tools</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Generate and deliver your nonprofit formation documents</li>
        <li>Submit filings to state and federal agencies on your behalf (for applicable service tiers)</li>
        <li>Send transactional emails including confirmations, receipts, and status updates</li>
        <li>Send compliance reminders if you have subscribed to that service</li>
        <li>Improve the platform through anonymized usage analytics</li>
        <li>Respond to support requests and communications</li>
        <li>Comply with legal obligations</li>
      </ul>
      <p>
        We do not sell your personal information to third parties. We do not
        use your information for advertising purposes.
      </p>

      <h2>3. Data Sharing</h2>
      <p>We share your information only in the following circumstances:</p>
      <ul>
        <li><strong>Service providers:</strong> Stripe (payments), Supabase (database and document storage), and email service providers, all subject to data processing agreements</li>
        <li><strong>Government agencies:</strong> State incorporation offices and the IRS, as necessary to fulfill your filing service</li>
        <li><strong>Legal compliance:</strong> Where required by law, court order, or to protect the rights and safety of FormRight and its users</li>
      </ul>

      <h2>4. Data Storage and Security</h2>
      <p>
        Your documents and personal data are stored on encrypted servers
        hosted on Supabase. We use industry-standard SSL/TLS encryption for
        all data in transit. Access to client data is restricted to
        authorized FormRight staff with a legitimate business need.
      </p>
      <p>
        While we implement reasonable security measures, no system is
        completely secure. We cannot guarantee the absolute security of your
        information.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain your account and document data for as long as your account
        is active and for a period of 7 years thereafter to comply with
        legal and tax recordkeeping requirements. You may request deletion of
        your account data subject to these retention obligations.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Depending on your location, you may have the following rights
        regarding your personal data:
      </p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data (subject to legal retention requirements)</li>
        <li>Opt out of non-essential communications</li>
        <li>Data portability (receive your data in a machine-readable format)</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <strong>
          <a href="mailto:privacy@formright.org">privacy@formright.org</a>
        </strong>
        .
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use essential cookies to keep you logged in and maintain your
        session. We may also use analytics cookies (e.g., Google Analytics)
        to understand how users interact with our platform. You can disable
        cookies in your browser settings, though this may affect platform
        functionality.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        FormRight is not intended for use by individuals under 18 years of
        age. We do not knowingly collect personal data from minors. If you
        believe a minor has provided us with personal data, please contact us
        immediately.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify
        registered users of significant changes via email. Your continued
        use of the Service after changes are posted constitutes acceptance
        of the updated policy.
      </p>

      <h2>10. Contact</h2>
      <p>
        For privacy-related questions or requests, contact us at{" "}
        <strong>
          <a href="mailto:privacy@formright.org">privacy@formright.org</a>
        </strong>
        .
      </p>
    </LegalShell>
  );
}
