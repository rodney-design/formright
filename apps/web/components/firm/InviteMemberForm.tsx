"use client";

import { useState } from "react";
import type { FirmRole } from "@/lib/queries/firms";

export default function InviteMemberForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<FirmRole>("firm_member");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function invite() {
    if (!email.trim()) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/firm/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not send invite");
      setMessage(`Invited ${email}.`);
      setEmail("");
      window.location.reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <div className="font-semibold text-navy mb-4">Invite a team member</div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@yourfirm.com"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as FirmRole)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="firm_member">Member</option>
          <option value="firm_admin">Admin</option>
        </select>
        <button
          onClick={invite}
          disabled={sending}
          className="bg-navy text-white text-sm font-semibold rounded-lg px-4 py-2"
        >
          {sending ? "Sending…" : "Send Invite"}
        </button>
      </div>
      {message && <p className="text-xs text-gray-500 mt-2">{message}</p>}
    </div>
  );
}
