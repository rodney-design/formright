"use client";

import { useOnboardStore, type OnboardState } from "@/lib/store/onboardStore";
import { Field, Select, FormGrid, FormActions } from "./fields";
import { Button } from "@/components/ui/Button";

const POLICY_LABELS: { key: keyof OnboardState["policies"]; label: string; required?: boolean }[] = [
  { key: "conflict", label: "Conflict of Interest Policy", required: true },
  { key: "whistleblower", label: "Whistleblower Policy" },
  { key: "retention", label: "Document Retention Policy" },
  { key: "gift", label: "Gift Acceptance Policy" },
  { key: "investment", label: "Investment Policy" },
];

export default function StepGovernance() {
  const s = useOnboardStore();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-navy">Governance Structure</h2>
        <p className="text-gray-500 text-sm mt-1">Define how your organization will be governed.</p>
      </div>
      <FormGrid>
        <Field label="Board Meeting Frequency">
          <Select value={s.meetingFrequency} onChange={(e) => s.setField("meetingFrequency", e.target.value)}>
            <option>Quarterly (recommended)</option>
            <option>Monthly</option>
            <option>Bi-annually</option>
            <option>Annually</option>
          </Select>
        </Field>
        <Field label="Quorum Requirement">
          <Select value={s.quorum} onChange={(e) => s.setField("quorum", e.target.value)}>
            <option>Majority (51%)</option>
            <option>Simple majority</option>
            <option>Two-thirds (66%)</option>
            <option>Three-quarters (75%)</option>
          </Select>
        </Field>
        <Field label="Director Term Length">
          <Select value={s.termLength} onChange={(e) => s.setField("termLength", e.target.value)}>
            <option>2 years</option>
            <option>1 year</option>
            <option>3 years</option>
            <option>4 years</option>
          </Select>
        </Field>
        <Field label="Term Limits">
          <Select value={s.termLimits} onChange={(e) => s.setField("termLimits", e.target.value)}>
            <option>No term limits</option>
            <option>Maximum 2 consecutive terms</option>
            <option>Maximum 3 consecutive terms</option>
          </Select>
        </Field>
        <Field label="Compensation Policy" full>
          <Select value={s.compensationPolicy} onChange={(e) => s.setField("compensationPolicy", e.target.value)}>
            <option>All directors serve without compensation (volunteer)</option>
            <option>Executive Director may be compensated; board serves without</option>
            <option>Compensation determined by board resolution</option>
          </Select>
        </Field>
        <Field label="Dissolution Clause" full hint="Required by IRS for tax-exempt status.">
          <Select value={s.dissolutionClause} onChange={(e) => s.setField("dissolutionClause", e.target.value)}>
            <option>Assets distributed to other 501(c)(3) organizations (standard)</option>
            <option>Assets distributed as specified in board resolution</option>
          </Select>
        </Field>
      </FormGrid>

      <div className="border-t border-gray-100 my-8" />
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Included Policies</div>
      <div className="flex flex-col gap-2.5">
        {POLICY_LABELS.map((p) => (
          <label key={p.key} className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={s.policies[p.key]}
              onChange={() => s.togglePolicy(p.key)}
              className="accent-teal"
            />
            <span>
              {p.label}
              {p.required && (
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-teal-pale text-teal px-2 py-0.5 rounded-full">
                  Required
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      <FormActions onBack={() => s.goToStep(3)} stepLabel="Step 4 of 6">
        <Button onClick={() => s.goToStep(5)}>Continue →</Button>
      </FormActions>
    </div>
  );
}
