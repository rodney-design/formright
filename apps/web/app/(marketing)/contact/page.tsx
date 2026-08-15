import type { Metadata } from "next";
import LegalShell from "@/components/marketing/LegalShell";

export const metadata: Metadata = {
  title: "Contact Us — FormRight",
};

const SUBJECT_OPTIONS = [
  "Question about forming my LLC",
  "Question about forming my C-Corp or S-Corp",
  "Question about forming my Nonprofit (501c3)",
  "Question about Benefit Corp or Professional Corp",
  "B2B / Pro tier inquiry",
  "Document download issue",
  "Billing or refund request",
  "Upgrade my plan",
  "API / integration inquiry",
  "Other",
];

export default function ContactPage() {
  return (
    <LegalShell
      tag="Company"
      title="Contact Us"
      dateLine="We respond to all inquiries within 1–2 business days"
      notice="Have a question about our services, your filing, or your account? We're here to help — no bots, no runaround."
      maxWidth="900px"
    >
      {/* Contact cards */}
      <div className="my-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-sm border border-rule bg-paper p-6 text-center">
          <div className="mb-3 text-[2rem]">📧</div>
          <div className="mb-[6px] font-bold text-ink">General Inquiries</div>
          <div className="mb-3 text-[.85rem] text-ink-faint">
            Questions about our services or platform
          </div>
          <a
            href="mailto:hello@formright.org"
            className="text-[.9rem] font-semibold text-stamp no-underline"
          >
            hello@formright.org
          </a>
        </div>
        <div className="rounded-sm border border-rule bg-paper p-6 text-center">
          <div className="mb-3 text-[2rem]">⚖️</div>
          <div className="mb-[6px] font-bold text-ink">Legal &amp; Compliance</div>
          <div className="mb-3 text-[.85rem] text-ink-faint">
            Terms, privacy, and legal notices
          </div>
          <a
            href="mailto:legal@formright.org"
            className="text-[.9rem] font-semibold text-stamp no-underline"
          >
            legal@formright.org
          </a>
        </div>
        <div className="rounded-sm border border-rule bg-paper p-6 text-center">
          <div className="mb-3 text-[2rem]">💳</div>
          <div className="mb-[6px] font-bold text-ink">Billing</div>
          <div className="mb-3 text-[.85rem] text-ink-faint">
            Payments, refunds, and invoices
          </div>
          <a
            href="mailto:billing@formright.org"
            className="text-[.9rem] font-semibold text-stamp no-underline"
          >
            billing@formright.org
          </a>
        </div>
      </div>

      <h2>Send Us a Message</h2>
      <p>
        Fill out the form below and our team will get back to you within 1–2
        business days. For urgent filing deadlines, please note that in your
        message.
      </p>

      <form className="mt-6 rounded-sm border border-rule bg-paper p-9">
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="contact-fname">
              First Name
            </label>
            <input
              id="contact-fname"
              type="text"
              placeholder="Jane"
              className="w-full rounded border border-rule px-[14px] py-[10px] text-[.95rem] text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="contact-lname">
              Last Name
            </label>
            <input
              id="contact-lname"
              type="text"
              placeholder="Smith"
              className="w-full rounded border border-rule px-[14px] py-[10px] text-[.95rem] text-ink"
            />
          </div>
        </div>
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="contact-email">
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="jane@example.org"
            className="w-full rounded border border-rule px-[14px] py-[10px] text-[.95rem] text-ink"
          />
        </div>
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="contact-subject">
            Subject
          </label>
          <select
            id="contact-subject"
            defaultValue=""
            className="w-full rounded border border-rule bg-paper-white px-[14px] py-[10px] text-[.95rem] text-ink"
          >
            <option value="">Select a topic…</option>
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="mb-7">
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="contact-msg">
            Message
          </label>
          <textarea
            id="contact-msg"
            rows={5}
            placeholder="Tell us how we can help. Include your order ID if applicable…"
            className="w-full resize-y rounded border border-rule px-[14px] py-[10px] text-[.95rem] text-ink"
          />
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded bg-stamp px-9 py-[15px] font-sans text-base font-bold text-paper-white"
        >
          Send Message →
        </button>
      </form>

      <h2 className="mt-12">Phone &amp; Hours</h2>
      <p>
        Our client success team is available by phone Monday through Friday,
        9:00 AM – 5:00 PM Eastern Time.
      </p>
      <p>
        <strong>Phone:</strong> (800) 555-0190
        <br />
        <strong>Hours:</strong> Mon–Fri, 9am–5pm ET
        <br />
        <strong>Response time:</strong> Email replies within 1–2 business days
      </p>

      <h2>Mailing Address</h2>
      <p>
        FormRight, PBC
        <br />
        1234 Purpose Ave, Suite 100
        <br />
        Wilmington, DE 19801
      </p>
    </LegalShell>
  );
}
