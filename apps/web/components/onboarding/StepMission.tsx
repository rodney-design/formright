"use client";

import { useState } from "react";
import { useOnboardStore } from "@/lib/store/onboardStore";
import { Field, TextArea, Select, FormGrid, FormActions } from "./fields";
import { Button } from "@/components/ui/Button";

export default function StepMission() {
  const s = useOnboardStore();
  const [error, setError] = useState(false);

  function next() {
    const missing = !s.mission.trim();
    setError(missing);
    if (missing) return;
    s.goToStep(3);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-navy">Mission & Programs</h2>
        <p className="text-gray-500 text-sm mt-1">Help us understand what your organization does.</p>
      </div>
      <FormGrid>
        <Field label="Mission Statement" required full hint="Should be clear, concise, and reflect your charitable purpose." error={error ? "Mission statement is required" : undefined}>
          <TextArea rows={3} value={s.mission} onChange={(e) => s.setField("mission", e.target.value)} placeholder="Briefly describe the organization's mission and purpose..." />
        </Field>
        <Field label="Program Description" required full hint="This section will be used in your IRS application narrative.">
          <TextArea rows={4} value={s.programs} onChange={(e) => s.setField("programs", e.target.value)} placeholder="Describe your primary programs and activities in detail. Include who is served, what services you provide, and how you measure impact..." />
        </Field>
        <Field label="Geographic Area Served">
          <Select value={s.geoArea} onChange={(e) => s.setField("geoArea", e.target.value)}>
            <option>Local community</option>
            <option>Statewide</option>
            <option>Regional (multi-state)</option>
            <option>National</option>
            <option>International</option>
          </Select>
        </Field>
        <Field label="Primary Beneficiaries">
          <Select value={s.beneficiaries} onChange={(e) => s.setField("beneficiaries", e.target.value)}>
            <option>General public</option>
            <option>Youth / Children</option>
            <option>Elderly / Seniors</option>
            <option>Low-income individuals</option>
            <option>Veterans</option>
            <option>People with disabilities</option>
            <option>Animals</option>
            <option>Environment</option>
            <option>Other</option>
          </Select>
        </Field>
        <Field label="Projected Annual Revenue (Year 1)" full hint="This helps determine whether you qualify for the 1023-EZ.">
          <Select value={s.revenue} onChange={(e) => s.setField("revenue", e.target.value)}>
            <option>Under $50,000</option>
            <option>$50,000 – $250,000</option>
            <option>$250,000 – $500,000</option>
            <option>Over $500,000</option>
          </Select>
        </Field>
      </FormGrid>
      <FormActions onBack={() => s.goToStep(1)} stepLabel="Step 2 of 6">
        <Button onClick={next}>Continue →</Button>
      </FormActions>
    </div>
  );
}
