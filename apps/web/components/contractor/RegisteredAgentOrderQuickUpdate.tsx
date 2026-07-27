"use client";

import { useState } from "react";
import { REGISTERED_AGENT_STATUSES, type RegisteredAgentStatus } from "@/lib/registered-agent/status";

export default function RegisteredAgentOrderQuickUpdate({ orderId, status }: { orderId: string; status: RegisteredAgentStatus }) {
  const [value, setValue] = useState<RegisteredAgentStatus>(status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(next: RegisteredAgentStatus) {
    setValue(next);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/contractor/registered-agent-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => save(e.target.value as RegisteredAgentStatus)}
        disabled={saving}
        className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
      >
        {REGISTERED_AGENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {saved && <span className="text-xs text-teal">Saved</span>}
    </div>
  );
}
