"use client";

import { useState } from "react";
import type { RegisteredAgentOrder, RegisteredAgentStatus } from "@/lib/registered-agent/status";
import { REGISTERED_AGENT_STATUSES } from "@/lib/registered-agent/status";
import type { StateFilingWorksheetField } from "@/lib/state-filing/types";
import type { ContractorWithUser } from "@/lib/contractors/types";

export default function RegisteredAgentPanel({
  order,
  packet,
  contractors,
}: {
  order: RegisteredAgentOrder;
  packet: StateFilingWorksheetField[];
  contractors: ContractorWithUser[];
}) {
  const [status, setStatus] = useState<RegisteredAgentStatus>(order.status);
  const [confirmationId, setConfirmationId] = useState(order.provider_confirmation_id ?? "");
  const [assignedContractorId, setAssignedContractorId] = useState(order.assigned_contractor_id ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/registered-agent-orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, providerConfirmationId: confirmationId, assignedContractorId }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
      <div className="font-semibold text-navy mb-1">Registered Agent — Northwest</div>
      <p className="text-xs text-gray-400 mb-4">
        Northwest&apos;s wholesale partnership is sales-gated, not a self-serve API — place this
        order by phone/email with your Northwest wholesale contact using the packet below, then
        record the result here.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5 bg-gray-50 rounded-xl p-4">
        {packet.map((f) => (
          <div key={f.label}>
            <span className="text-gray-400 text-xs">{f.label}</span>
            <div className="text-navy font-medium">{f.value || "—"}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Order status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RegisteredAgentStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {REGISTERED_AGENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Northwest confirmation / order ID</label>
          <input
            type="text"
            value={confirmationId}
            onChange={(e) => setConfirmationId(e.target.value)}
            placeholder="e.g. Northwest order number"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Assigned contractor</label>
          <select
            value={assignedContractorId}
            onChange={(e) => setAssignedContractorId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Unassigned</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.email}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-navy text-white text-sm font-semibold rounded-lg px-4 py-2 h-fit"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-xs text-teal">Saved</span>}
      </div>
    </div>
  );
}
