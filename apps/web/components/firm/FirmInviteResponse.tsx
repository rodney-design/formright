"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FirmInviteResponse({ firmId, firmName }: { firmId: string; firmName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(action: "accept" | "decline") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/firm/invites/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Something went wrong, please try again.");
      }
      router.push(action === "accept" ? "/firm" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again.");
      setBusy(null);
    }
  }

  return (
    <div className="max-w-md mx-auto text-center py-24 px-6">
      <div className="text-4xl mb-4">🤝</div>
      <h1 className="text-xl font-serif font-bold text-navy mb-2">Join {firmName}?</h1>
      <p className="text-gray-500 text-sm mb-6">
        You&apos;ve been invited to join <strong>{firmName}</strong>&apos;s team on FormRight. Accepting
        gives them access to a shared client dashboard, and adds a seat to their billing.
      </p>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => respond("decline")}
          disabled={busy !== null}
          className="border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg px-4 py-2"
        >
          {busy === "decline" ? "Declining…" : "Decline"}
        </button>
        <button
          onClick={() => respond("accept")}
          disabled={busy !== null}
          className="bg-navy text-white text-sm font-semibold rounded-lg px-4 py-2"
        >
          {busy === "accept" ? "Joining…" : `Join ${firmName}`}
        </button>
      </div>
    </div>
  );
}
