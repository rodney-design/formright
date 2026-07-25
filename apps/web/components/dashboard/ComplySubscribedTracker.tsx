"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

// Fires when Stripe redirects back to /dashboard/billing?comply=success —
// the funnel's final conversion event.
export default function ComplySubscribedTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track("comply_subscribed");
  }, []);

  return null;
}
