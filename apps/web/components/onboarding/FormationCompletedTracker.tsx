"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

// Fires once when the post-checkout success page renders — the funnel's
// completion event, paired with Wizard.tsx's formation_started.
export default function FormationCompletedTracker({ registrationId }: { registrationId?: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track("formation_completed", { registrationId });
  }, [registrationId]);

  return null;
}
