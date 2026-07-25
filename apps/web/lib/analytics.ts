"use client";

import posthog from "posthog-js";

let initialized = false;

// PostHog is optional — a missing key is a silent no-op, same posture as the
// rest of the app's optional integrations (SENTRY_DSN, etc.) rather than a
// hard failure in environments that haven't configured it yet.
export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
  });
  initialized = true;
}

export function track(event: string, properties?: Record<string, unknown>): void {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identify(userId: string, properties?: Record<string, unknown>): void {
  if (!initialized) return;
  posthog.identify(userId, properties);
}
