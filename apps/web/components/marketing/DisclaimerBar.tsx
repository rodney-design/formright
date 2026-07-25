import Link from "next/link";

export default function DisclaimerBar() {
  return (
    <div className="border-t border-rule bg-paper px-6 py-5 text-center text-[.78rem] leading-[1.7] text-ink-faint md:px-12">
      <strong className="text-ink">Legal Disclaimer:</strong> FormRight is not
      a law firm and does not provide legal advice. We provide document
      preparation, filing assistance, and compliance education for all U.S.
      business entity types. No attorney-client relationship is created by
      using this platform. All filings are subject to state and federal
      processing times. Users are responsible for reviewing all documents
      before submission. &nbsp;·&nbsp;{" "}
      <Link href="/disclaimer" className="text-ink-faint no-underline">
        Full Disclaimer
      </Link>{" "}
      &nbsp;·&nbsp;{" "}
      <Link href="/privacy" className="text-ink-faint no-underline">
        Privacy Policy
      </Link>
    </div>
  );
}
