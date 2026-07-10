"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function ComplySubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/comply/checkout", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not start checkout");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={subscribe} disabled={loading}>
        {loading ? "Redirecting to payment…" : "Subscribe — $149/yr"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
