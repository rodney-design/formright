"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContractorPayout } from "@/lib/contractors/types";

export default function ContractorPayoutsPanel({ contractorId, payouts }: { contractorId: string; payouts: ContractorPayout[] }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  async function createPayout() {
    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/contractors/${contractorId}/payouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      });
      if (res.ok) {
        setAmount("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(payoutId: string) {
    setMarkingId(payoutId);
    try {
      const res = await fetch(`/api/admin/contractor-payouts/${payoutId}`, { method: "PATCH" });
      if (res.ok) router.refresh();
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
      <div className="font-semibold text-navy mb-4">Payouts</div>

      <div className="flex items-end gap-3 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
          />
        </div>
        <button
          onClick={createPayout}
          disabled={saving || !amount}
          className="bg-navy text-white text-sm font-semibold rounded-lg px-4 py-2 h-fit"
        >
          {saving ? "Adding…" : "Record payout"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {payouts.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-4 py-3">
            <span className="text-navy font-medium">${(p.amount_cents / 100).toFixed(2)}</span>
            <span className={p.status === "paid" ? "text-teal" : "text-amber-600"}>{p.status}</span>
            {p.status === "pending" && (
              <button
                onClick={() => markPaid(p.id)}
                disabled={markingId === p.id}
                className="border border-gray-300 rounded-lg px-3 py-1 text-xs font-semibold text-navy"
              >
                {markingId === p.id ? "Saving…" : "Mark paid"}
              </button>
            )}
          </div>
        ))}
        {payouts.length === 0 && <p className="text-sm text-gray-400">No payouts recorded yet.</p>}
      </div>
    </div>
  );
}
