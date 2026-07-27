"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContractorStatus } from "@/lib/contractors/types";

export default function ContractorStatusToggle({ contractorId, status }: { contractorId: string; status: ContractorStatus }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const next: ContractorStatus = status === "active" ? "inactive" : "active";

  async function toggle() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/contractors/${contractorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-navy"
    >
      {saving ? "Saving…" : status === "active" ? "Mark inactive" : "Mark active"}
    </button>
  );
}
