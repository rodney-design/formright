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
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <div className="mb-3 text-[2rem]">📧</div>
          <div className="mb-[6px] font-bold text-navy">General Inquiries</div>
          <div className="mb-3 text-[.85rem] text-slate-500">
            Questions about our services or platform
          </div>
          <a
            href="mailto:hello@rightform.org"
            className="text-[.9rem] font-semibold text-teal no-underline"
          >
            hello@rightform.org
          </a>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <div className="mb-3 text-[2rem]">⚖️</div>
          <div className="mb-[6px] font-bold text-navy">Legal &amp; Compliance</div>
          <div className="mb-3 text-[.85rem] text-slate-500">
            Terms, privacy, and legal notices
          </div>
          <a
            href="mailto:legal@rightform.org"
            className="text-[.9rem] font-semibold text-teal no-underline"
          >
            legal@rightform.org
          </a>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <div className="mb-3 text-[2rem]">💳</div>
          <div className="mb-[6px] font-bold text-navy">Billing</div>
          <div className="mb-3 text-[.85rem] text-slate-500">
            Payments, refunds, and invoices
          </div>
          <a
            href="mailto:billing@rightform.org"
            className="text-[.9rem] font-semibold text-teal no-underline"
          >
            billing@rightform.org
          </a>
        </div>
      </div>

      <h2>Send Us a Message</h2>
      <p>
        Fill out the form below and our team will get back to you within 1–2
        business days. For urgent filing deadlines, please note that in your
        message.
      </p>

      <form className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-9">
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy" htmlFor="contact-fname">
              First Name
            </label>
            <input
              id="contact-fname"
              type="text"
              placeholder="Jane"
              className="w-full rounded-lg border border-slate-300 px-[14px] py-[10px] text-[.95rem] text-navy"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy" htmlFor="contact-lname">
              Last Name
            </label>
            <input
              id="contact-lname"
              type="text"
              placeholder="Smith"
              className="w-full rounded-lg border border-slate-300 px-[14px] py-[10px] text-[.95rem] text-navy"
            />
          </div>
        </div>
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-navy" htmlFor="contact-email">
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="jane@example.org"
            className="w-full rounded-lg border border-slate-300 px-[14px] py-[10px] text-[.95rem] text-navy"
          />
        </div>
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-navy" htmlFor="contact-subject">
            Subject
          </label>
          <select
            id="contact-subject"
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 bg-white px-[14px] py-[10px] text-[.95rem] text-navy"
          >
            <option value="">Select a topic…</option>
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="mb-7">
          <label className="mb-1 block text-sm font-medium text-navy" htmlFor="contact-msg">
            Message
          </label>
          <textarea
            id="contact-msg"
            rows={5}
            placeholder="Tell us how we can help. Include your order ID if applicable…"
            className="w-full resize-y rounded-lg border border-slate-300 px-[14px] py-[10px] text-[.95rem] text-navy"
          />
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-brand bg-gold px-9 py-[15px] font-sans text-base font-bold text-navy shadow-gold"
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
        FormRight, Inc.
        <br />
        1234 Purpose Ave, Suite 100
        <br />
        Wilmington, DE 19801
      </p>
    </LegalShell>
  );
}
