"use client";

import { useState } from "react";

const STATUS_OPTIONS = ["pending", "paid", "in_review", "filed", "complete", "payment_failed"];

export default function AdminRegDetailForm({
  id,
  status: initialStatus,
  notes: initialNotes,
}: {
  id: string;
  status: string;
  notes: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="font-semibold text-navy mb-4">Status & Notes</div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 bg-white"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Internal Notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        placeholder="Internal notes about this registration..."
      />
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-navy text-white text-sm font-semibold rounded-lg px-4 py-2"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saved && <span className="text-xs text-teal">Saved</span>}
      </div>
    </div>
  );
}
