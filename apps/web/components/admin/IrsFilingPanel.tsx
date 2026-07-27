"use client";

import { useState } from "react";
import { IRS_FILING_STATUSES, type IrsFilingStatus, type IrsFiling } from "@/lib/irs-filing/status";

const STATUS_LABELS: Record<IrsFilingStatus, string> = {
  not_started: "Not started",
  ein_obtained: "EIN obtained",
  submitted: "Submitted to IRS",
  additional_info_requested: "IRS requested additional info",
  approved: "Approved — exempt",
  denied: "Denied",
};

export default function IrsFilingPanel({ filing }: { filing: IrsFiling }) {
  const [status, setStatus] = useState<IrsFilingStatus>(filing.status);
  const [ein, setEin] = useState(filing.ein ?? "");
  const [letter, setLetter] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasLetter, setHasLetter] = useState(!!filing.determination_letter_s3_key);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.set("status", status);
      if (ein) formData.set("ein", ein);
      if (letter) formData.set("determinationLetter", letter);

      const res = await fetch(`/api/admin/irs-filings/${filing.id}`, { method: "PATCH", body: formData });
      if (res.ok) {
        setSaved(true);
        if (letter) setHasLetter(true);
        setLetter(null);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
      <div className="font-semibold text-navy mb-1">
        Federal 501(c)(3) Status — {filing.filing_type === "1023-ez" ? "Form 1023-EZ" : "Form 1023"}
      </div>
      <p className="text-xs text-gray-400 mb-4">
        No IRS API exists for exemption-application status — check pay.gov / the IRS Tax Exempt
        Organization Search and record the result here.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as IrsFilingStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {IRS_FILING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">EIN</label>
          <input
            type="text"
            value={ein}
            onChange={(e) => setEin(e.target.value)}
            placeholder="XX-XXXXXXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Determination letter {hasLetter && <span className="text-teal">(on file)</span>}
          </label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setLetter(e.target.files?.[0] ?? null)}
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
    </div>
  );
}
