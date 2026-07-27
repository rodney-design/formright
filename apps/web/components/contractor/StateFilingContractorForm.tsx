"use client";

import { useState } from "react";
import { FILING_STATUSES, type FilingStatus, type StateFiling } from "@/lib/state-filing/status";

export default function StateFilingContractorForm({ filing }: { filing: StateFiling }) {
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(filing.filing_status);
  const [confirmationId, setConfirmationId] = useState(filing.state_confirmation_id ?? "");
  const [stampedDoc, setStampedDoc] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasStampedDoc, setHasStampedDoc] = useState(!!filing.stamped_doc_s3_key);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.set("filingStatus", filingStatus);
      if (confirmationId) formData.set("stateConfirmationId", confirmationId);
      if (stampedDoc) formData.set("stampedDoc", stampedDoc);

      const res = await fetch(`/api/contractor/state-filings/${filing.id}`, { method: "PATCH", body: formData });
      if (res.ok) {
        setSaved(true);
        if (stampedDoc) setHasStampedDoc(true);
        setStampedDoc(null);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Filing status</label>
        <select
          value={filingStatus}
          onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {FILING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700 mb-1">State confirmation ID</label>
        <input
          type="text"
          value={confirmationId}
          onChange={(e) => setConfirmationId(e.target.value)}
          placeholder="e.g. filing receipt / control number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Stamped certificate {hasStampedDoc && <span className="text-teal">(on file)</span>}
        </label>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setStampedDoc(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
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
  );
}
