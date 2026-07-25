"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

// Post-formation upsell interstitial (System 1 — Comply auto-conversion
// funnel). Rendered on /onboard/success, before the founder has ever logged
// in, so it posts to /api/subscriptions/comply/checkout with registrationId
// rather than relying on a session (see that route's comment for the trust
// model). Also the target of the confirmation email's Comply CTA link
// (?registration=X takes the founder straight back to this card).
export default function ComplyUpsellCard({ registrationId }: { registrationId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const shownTracked = useRef(false);

  useEffect(() => {
    if (shownTracked.current) return;
    shownTracked.current = true;
    track("comply_upsell_shown", { surface: "onboard_success", registrationId });
  }, [registrationId]);

  async function subscribe() {
    setLoading(true);
    setError(null);
    track("comply_upsell_clicked", { surface: "onboard_success", registrationId });
    try {
      const res = await fetch("/api/subscriptions/comply/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not start checkout");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again.");
      setLoading(false);
    }
  }

  if (dismissed) return null;

  return (
    <div className="bg-white border-2 border-teal/30 rounded-2xl p-6 text-left mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-teal mb-2">
            Recommended
          </div>
          <h4 className="font-semibold text-navy mb-2">
            Don&apos;t miss your first compliance deadline
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            FormRight Comply tracks your annual report, IRS deadlines, and state renewals
            automatically — with email reminders 90, 60, and 30 days out. Most new entities miss
            at least one filing in year one; Comply is built so you don&apos;t.
          </p>
        </div>
        <div className="text-3xl shrink-0">🔔</div>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={subscribe}
          disabled={loading}
          className="bg-teal text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-teal/90 disabled:opacity-60"
        >
          {loading ? "Redirecting to payment…" : "Add FormRight Comply — $149/yr"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          No thanks, maybe later
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  );
}
