"use client";

import { useState } from "react";
import type { Firm } from "@/lib/queries/firms";

export default function FirmSettingsForm({ firm }: { firm: Firm }) {
  const [name, setName] = useState(firm.name);
  const [logoUrl, setLogoUrl] = useState(firm.branding?.logoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(firm.branding?.primaryColor ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/firm/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logoUrl, primaryColor: primaryColor.replace(/^#/, "") }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not save settings");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="font-semibold text-navy mb-1">White-label branding</div>
      <p className="text-xs text-gray-400 mb-4">
        Applied to your clients&apos; document cover pages and footers — not full document
        re-theming (see README).
      </p>
      <div className="flex flex-col gap-4 max-w-md">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Firm name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Logo URL</label>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://yourfirm.com/logo.png"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Accent color (hex)</label>
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            placeholder="1B9AAA"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-navy text-white text-sm font-semibold rounded-lg px-4 py-2 w-fit"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-xs text-teal">Saved</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}
