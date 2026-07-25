import Link from "next/link";

// Persistent dashboard nudge (System 1c) for signed-in users without an
// active Comply subscription — the third and final touchpoint in the funnel
// after the post-formation upsell (1a) and confirmation email (1b), for
// founders who skipped both.
export default function ComplyNudgeBanner() {
  return (
    <div className="bg-teal-pale border border-teal/20 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="font-semibold text-navy text-sm">🔔 You don&apos;t have compliance reminders set up</div>
        <p className="text-sm text-gray-600 mt-1">
          FormRight Comply tracks your annual report and IRS deadlines automatically — $149/yr.
        </p>
      </div>
      <Link
        href="/dashboard/billing"
        className="text-sm font-semibold text-teal shrink-0 hover:underline"
      >
        Add Comply →
      </Link>
    </div>
  );
}
