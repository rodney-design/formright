"use client";

import { useState } from "react";
import { useOnboardStore } from "@/lib/store/onboardStore";
import StepOrganization from "./StepOrganization";
import StepMission from "./StepMission";
import StepBoard from "./StepBoard";
import StepGovernance from "./StepGovernance";
import StepIrsScreening from "./StepIrsScreening";
import StepContactPayment from "./StepContactPayment";

const STEPS = [
  { n: 1, label: "Organization" },
  { n: 2, label: "Mission & Programs" },
  { n: 3, label: "Board Members" },
  { n: 4, label: "Governance" },
  { n: 5, label: "IRS Screening" },
  { n: 6, label: "Contact & Payment" },
];

export default function Wizard() {
  const step = useOnboardStore((s) => s.step);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="flex max-w-6xl mx-auto min-h-[70vh] mt-8 mb-16 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <aside className="w-64 shrink-0 bg-navy text-white p-6 hidden md:block">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/50 mb-5">
          Your Progress
        </div>
        <div className="flex flex-col gap-1">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                s.n === step ? "bg-white/10 font-semibold" : "text-white/60"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  s.n < step
                    ? "bg-teal text-white"
                    : s.n === step
                    ? "bg-gold text-navy font-bold"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {s.n < step ? "✓" : s.n}
              </div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-white/40">
          🔒 Your information is encrypted and never shared.
        </p>
      </aside>
      <div className="flex-1 p-8 md:p-10 bg-white">
        {step === 1 && <StepOrganization />}
        {step === 2 && <StepMission />}
        {step === 3 && <StepBoard />}
        {step === 4 && <StepGovernance />}
        {step === 5 && <StepIrsScreening />}
        {step === 6 && <StepContactPayment submitting={submitting} setSubmitting={setSubmitting} />}
      </div>
    </div>
  );
}
