import type { Metadata } from "next";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Refund Policy — FormRight",
};

export default function RefundPage() {
  return (
    <LegalShell
      tag="Legal"
      title="Refund Policy"
      dateLine={
        <>Effective Date: January 1, 2026 &nbsp;·&nbsp; Last Updated: March 1, 2026</>
      }
      notice="We stand behind the quality of our service. Please review this policy carefully before purchasing."
    >
      <h2>Our Commitment</h2>
      <p>
        FormRight is committed to delivering high-quality document
        preparation and filing services. We want every client to feel
        confident in their purchase. This policy outlines the circumstances
        under which refunds are available.
      </p>

      <h2>Starter Plan — $49</h2>
      <p>
        <strong>Refund window:</strong> 48 hours from the time of purchase,
        provided documents have not been downloaded.
      </p>
      <p>
        Once documents have been accessed or downloaded, the Starter plan is
        non-refundable, as the deliverable has been fully provided. If you
        experience a technical issue preventing document access, contact us
        within 48 hours and we will resolve it or issue a full refund.
      </p>

      <h2>Standard Plan — $149</h2>
      <p>
        <strong>Before state filing is submitted:</strong> Full refund
        available within 5 business days of purchase if you request
        cancellation before we have submitted any filings on your behalf.
      </p>
      <p>
        <strong>After state filing is submitted:</strong> No refund is
        available once the state filing has been submitted, as government
        filing fees and staff time are non-recoverable. A partial credit of
        $150 may be applied toward a future FormRight service at our
        discretion.
      </p>

      <h2>Pro Plan — $249</h2>
      <p>
        <strong>Before IRS submission:</strong> A refund of $800 is available
        if cancellation is requested before the IRS 1023-EZ application is
        submitted. The $399 non-refundable portion covers document
        preparation, state filing, and EIN processing already completed.
      </p>
      <p>
        <strong>After IRS submission:</strong> No refund is available once
        the IRS application has been submitted. IRS determination outcomes —
        including approval, rejection, or request for additional
        information — are outside FormRight&apos;s control and do not
        qualify for refund.
      </p>

      <h2>Full Form 1023 (Long Form) — $3,500+</h2>
      <p>
        Refund terms for Full 1023 engagements are specified in your
        individual service agreement. Generally, a refund of unused
        hours/phases is available upon written cancellation request, less a
        non-refundable retainer of $750 for work already completed.
      </p>

      <h2>Add-On Services</h2>
      <ul>
        <li><strong>Registered Agent ($129/yr):</strong> Refundable within 30 days of purchase if no registered agent services have been provided. Pro-rated refunds are not available after 30 days.</li>
        <li><strong>Compliance Reminders ($49/yr):</strong> Non-refundable after activation.</li>
        <li><strong>Board Training ($199):</strong> Refundable up to 48 hours before the scheduled session. No refund for no-shows or late cancellations.</li>
      </ul>

      <h2>IRS and State Filing Outcomes</h2>
      <p>
        FormRight does not issue refunds based on IRS or state agency
        decisions, including rejection of filings, requests for additional
        information, or denial of tax-exempt status. These outcomes are
        determined solely by government agencies and are outside our
        control.
      </p>
      <p>
        If a rejection occurs due to a{" "}
        <strong>documented error made by FormRight</strong> (not based on
        information you provided), we will correct and resubmit at no
        additional charge.
      </p>

      <h2>How to Request a Refund</h2>
      <p>
        To request a refund, email{" "}
        <strong>
          <a href="mailto:billing@formright.org">billing@formright.org</a>
        </strong>{" "}
        with your name, order ID, and reason for the request. We respond to
        all refund requests within 2 business days. Approved refunds are
        processed within 5–10 business days to your original payment method.
      </p>

      <h2>Chargebacks</h2>
      <p>
        We encourage you to contact us directly before initiating a
        chargeback with your bank or credit card company. Unresolved
        chargebacks may result in suspension of your FormRight account. We
        cooperate fully with all payment dispute processes.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about refunds? Reach us at{" "}
        <strong>
          <a href="mailto:billing@formright.org">billing@formright.org</a>
        </strong>{" "}
        or call <strong>(800) 555-0190</strong> Monday–Friday, 9am–5pm ET.
      </p>
    </LegalShell>
  );
}
