"use client";

import { useState } from "react";
import { useOnboardStore } from "@/lib/store/onboardStore";
import { Field, TextInput, Select, FormActions } from "./fields";
import { Button } from "@/components/ui/Button";

const ROLE_OPTIONS = ["President", "Vice President", "Secretary", "Treasurer", "Director"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StepBoard() {
  const s = useOnboardStore();
  const [attempted, setAttempted] = useState(false);

  const memberErrors = s.board.map((m) => ({
    name: !m.name.trim(),
    email: !EMAIL_RE.test(m.email.trim()),
  }));
  const hasErrors = s.board.length < 3 || memberErrors.some((e) => e.name || e.email);

  function next() {
    setAttempted(true);
    if (hasErrors) return;
    s.goToStep(4);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-navy">Board Members</h2>
        <p className="text-gray-500 text-sm mt-1">A minimum of 3 board members is required for 501(c)(3) status.</p>
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Board Members (minimum 3)
      </div>
      <div className="flex flex-col gap-4">
        {s.board.map((m, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <Field label="Full Name" required error={attempted && memberErrors[i].name ? "Name is required" : undefined}>
              <TextInput value={m.name} onChange={(e) => s.updateBoardMember(i, { name: e.target.value })} placeholder="Jane Smith" />
            </Field>
            <Field label="Role / Title">
              <Select value={m.role} onChange={(e) => s.updateBoardMember(i, { role: e.target.value })}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Email" required error={attempted && memberErrors[i].email ? "Valid email is required" : undefined}>
              <TextInput type="email" value={m.email} onChange={(e) => s.updateBoardMember(i, { email: e.target.value })} placeholder="jane@email.com" />
            </Field>
            {s.board.length > 3 && (
              <button
                type="button"
                onClick={() => s.removeBoardMember(i)}
                className="h-10 w-10 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"
                aria-label="Remove board member"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={s.addBoardMember}
        className="mt-4 text-sm font-semibold text-teal border border-dashed border-teal/40 rounded-lg px-4 py-2 hover:bg-teal-pale"
      >
        + Add Another Board Member
      </button>

      <div className="border-t border-gray-100 my-8" />
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Registered Agent</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Registered Agent Name">
          <TextInput value={s.registeredAgentName} onChange={(e) => s.setField("registeredAgentName", e.target.value)} placeholder="Agent name or company" />
        </Field>
        <Field label="Agent Address">
          <TextInput value={s.registeredAgentAddress} onChange={(e) => s.setField("registeredAgentAddress", e.target.value)} placeholder="Street address" />
        </Field>
      </div>
      <div className="mt-3 bg-teal-pale rounded-lg px-4 py-3 text-sm text-teal flex gap-2 items-start">
        <span>💡</span>
        <span>
          Don&apos;t have a registered agent? Add our <strong>Registered Agent service</strong> at checkout.
        </span>
      </div>

      <FormActions onBack={() => s.goToStep(2)} stepLabel="Step 3 of 6">
        <Button onClick={next}>Continue →</Button>
      </FormActions>
    </div>
  );
}
