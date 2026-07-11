"use client";

import { useState } from "react";
import type { ApiKeySummary } from "@/lib/queries/apiKeys";

export default function ApiKeysManager({
  initialKeys,
  isAdmin,
}: {
  initialKeys: ApiKeySummary[];
  isAdmin: boolean;
}) {
  const [keys, setKeys] = useState(initialKeys);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function create() {
    setCreating(true);
    try {
      const res = await fetch("/api/firm/api-keys", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setNewKey(json.key);
        setKeys((prev) => [{ id: json.id, created_at: new Date().toISOString(), revoked_at: null }, ...prev]);
      }
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    const res = await fetch(`/api/firm/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revoked_at: new Date().toISOString() } : k)));
    }
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={create}
            disabled={creating}
            className="bg-navy text-white text-sm font-semibold rounded-lg px-4 py-2"
          >
            {creating ? "Generating…" : "Generate New API Key"}
          </button>
          {newKey && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
              <div className="font-semibold text-amber-800 mb-1">
                Copy this key now — it won&apos;t be shown again.
              </div>
              <code className="text-xs break-all text-navy">{newKey}</code>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 font-medium">Key ID</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium">Status</th>
              {isAdmin && <th className="px-6 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-mono text-xs text-navy">{k.id}</td>
                <td className="px-6 py-3 text-gray-600">{new Date(k.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-3">
                  {k.revoked_at ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                      Revoked
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-pale text-teal border border-teal/20">
                      Active
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-6 py-3">
                    {!k.revoked_at && (
                      <button onClick={() => revoke(k.id)} className="text-red-600 text-xs font-semibold">
                        Revoke
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="px-6 py-10 text-center text-gray-400">
                  No API keys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
