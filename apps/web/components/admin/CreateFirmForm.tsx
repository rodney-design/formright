"use client";

import { useState } from "react";

export default function CreateFirmForm() {
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function create() {
    if (!name.trim() || !adminEmail.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/firms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, adminEmail, adminName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not create firm");
      setMessage(`Created "${name}" — ${adminEmail} can now sign in and land on /firm.`);
      setName("");
      setAdminEmail("");
      setAdminName("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="font-semibold text-navy mb-1">Create a Pro firm</div>
      <p className="text-xs text-gray-400 mb-4">
        Sales-assisted onboarding (brief §4.3: Pro tier is Contact Sales, not self-serve) — use
        this after the sales conversation concludes.
      </p>
      <div className="flex flex-col gap-3 max-w-md">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Firm name"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="Founding admin email"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          placeholder="Founding admin name (optional)"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={create}
          disabled={saving}
          className="bg-navy text-white text-sm font-semibold rounded-lg px-4 py-2 w-fit"
        >
          {saving ? "Creating…" : "Create Firm"}
        </button>
        {message && <p className="text-xs text-gray-500">{message}</p>}
      </div>
    </div>
  );
}
