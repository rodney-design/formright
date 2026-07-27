"use client";

import { useState } from "react";
import type { FilingChecklistItem } from "@/lib/contractors/types";

export default function ChecklistPanel({ items }: { items: FilingChecklistItem[] }) {
  const [state, setState] = useState(items);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function toggle(item: FilingChecklistItem) {
    const completed = !item.completed_at;
    setSavingId(item.id);
    try {
      const res = await fetch(`/api/contractor/checklist-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (res.ok) {
        const { item: updated } = await res.json();
        setState((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {state.map((item) => (
        <label key={item.id} className="flex items-center gap-3 text-sm border border-gray-100 rounded-lg px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!item.completed_at}
            disabled={savingId === item.id}
            onChange={() => toggle(item)}
          />
          <span className={item.completed_at ? "text-gray-400 line-through" : "text-navy"}>{item.label}</span>
        </label>
      ))}
    </div>
  );
}
