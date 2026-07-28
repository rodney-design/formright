"use client";

import { useState } from "react";

export default function RemoveMemberButton({ memberId }: { memberId: string }) {
  const [removing, setRemoving] = useState(false);

  async function remove() {
    if (!confirm("Remove this team member? They'll lose access to the firm dashboard.")) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/firm/members/${memberId}`, { method: "DELETE" });
      if (res.ok) {
        window.location.reload();
      } else {
        const json = await res.json().catch(() => null);
        alert(json?.error ?? "Could not remove this team member.");
      }
    } finally {
      setRemoving(false);
    }
  }

  return (
    <button onClick={remove} disabled={removing} className="text-red-600 text-xs font-semibold">
      {removing ? "Removing…" : "Remove"}
    </button>
  );
}
