"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

// Mounted once in the root layout. A standalone client component (rather than
// making the layout itself "use client") so the layout stays a server
// component and this is the only piece that needs the browser.
export default function PostHogInit() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
