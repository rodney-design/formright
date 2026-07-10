"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Registration } from "@/lib/queries/registrations";
import StatusBadge from "@/components/dashboard/StatusBadge";

const STATUS_OPTIONS = ["pending", "paid", "in_review", "filed", "complete", "payment_failed"];

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function toCsv(rows: Registration[]): string {
  const header = ["Organization", "Plan", "State", "Contact", "Submitted", "Status", "Amount"];
  const lines = rows.map((r) =>
    [
      r.orgname,
      r.plan,
      r.state,
      r.contact_email ?? "",
      new Date(r.created_at).toISOString().split("T")[0],
      r.status,
      (r.amount_cents / 100).toFixed(2),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export default function AdminPipelineTable({ registrations }: { registrations: Registration[] }) {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState(registrations);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.orgname.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.contact_email ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } finally {
      setUpdating(null);
    }
  }

  function exportCsv() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formright_registrations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-navy">All Registrations</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search organizations..."
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          />
          <button
            onClick={exportCsv}
            className="bg-navy text-white text-xs font-semibold rounded-lg px-3.5 py-2"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 font-medium">Organization</th>
              <th className="px-6 py-3 font-medium">Plan</th>
              <th className="px-6 py-3 font-medium">State</th>
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-6 py-3 font-medium">Submitted</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-6 py-3">
                  <div className="font-medium text-navy">{r.orgname}</div>
                  <div className="text-xs text-gray-400">{r.id}</div>
                </td>
                <td className="px-6 py-3 text-gray-600">{r.plan}</td>
                <td className="px-6 py-3 text-gray-600">{r.state}</td>
                <td className="px-6 py-3 text-gray-600">{r.contact_email}</td>
                <td className="px-6 py-3 text-gray-600">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-3">
                  <select
                    value={r.status}
                    disabled={updating === r.id}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1">
                    <StatusBadge status={r.status} />
                  </div>
                </td>
                <td className="px-6 py-3 text-navy font-medium">{formatCents(r.amount_cents)}</td>
                <td className="px-6 py-3">
                  <Link href={`/admin/registrations/${r.id}`} className="text-teal font-semibold text-xs">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                  No registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
