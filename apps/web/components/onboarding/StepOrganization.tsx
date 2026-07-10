"use client";

import { useState } from "react";
import { useOnboardStore } from "@/lib/store/onboardStore";
import { STATE_FEES } from "@/lib/entities/stateFees";
import { ENTITY_TYPE_OPTIONS } from "@/lib/data/entityTypeOptions";
import { Field, TextInput, Select, FormGrid, FormActions } from "./fields";
import { Button } from "@/components/ui/Button";

const STATES = Object.keys(STATE_FEES);

export default function StepOrganization() {
  const s = useOnboardStore();
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function next() {
    const nextErrors = {
      orgname: !s.orgname.trim(),
      orgtype: !s.orgtype,
      state: !s.state,
      address: !s.address.trim(),
      city: !s.city.trim(),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    s.goToStep(2);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-navy">Organization Details</h2>
        <p className="text-gray-500 text-sm mt-1">
          Tell us about the entity you&apos;re forming. All 7 U.S. entity types supported.
        </p>
      </div>
      <FormGrid>
        <Field label="Organization / Business Name" required full hint="This will appear on all legal documents." error={errors.orgname ? "Organization name is required" : undefined}>
          <TextInput
            value={s.orgname}
            onChange={(e) => s.setField("orgname", e.target.value)}
            placeholder="e.g. Bright Futures Foundation, Acme Ventures LLC"
          />
        </Field>
        <Field label="Entity Type" required error={errors.orgtype ? "Please select an entity type" : undefined}>
          <Select value={s.orgtype} onChange={(e) => s.setField("orgtype", e.target.value)}>
            <option value="">Select entity type...</option>
            {ENTITY_TYPE_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </Select>
        </Field>
        <Field label="State of Formation" required error={errors.state ? "Please select a state" : undefined}>
          <Select value={s.state} onChange={(e) => s.setField("state", e.target.value)}>
            <option value="">Select state...</option>
            {STATES.map((st) => (
              <option key={st}>{st}</option>
            ))}
          </Select>
        </Field>
        <Field label="Fiscal Year End">
          <Select value={s.fiscal} onChange={(e) => s.setField("fiscal", e.target.value)}>
            <option>December 31</option>
            <option>June 30</option>
            <option>September 30</option>
            <option>March 31</option>
          </Select>
        </Field>
        <Field label="Principal Street Address" required error={errors.address ? "Address is required" : undefined}>
          <TextInput value={s.address} onChange={(e) => s.setField("address", e.target.value)} placeholder="123 Main Street" />
        </Field>
        <Field label="City" required error={errors.city ? "City is required" : undefined}>
          <TextInput value={s.city} onChange={(e) => s.setField("city", e.target.value)} placeholder="City" />
        </Field>
        <Field label="ZIP Code">
          <TextInput value={s.zip} onChange={(e) => s.setField("zip", e.target.value)} placeholder="12345" maxLength={10} />
        </Field>
        <Field label="EIN (if existing)" hint="Leave blank if not yet assigned">
          <TextInput value={s.ein} onChange={(e) => s.setField("ein", e.target.value)} placeholder="XX-XXXXXXX" maxLength={10} />
        </Field>
      </FormGrid>
      <FormActions stepLabel="Step 1 of 6">
        <Button onClick={next}>Continue →</Button>
      </FormActions>
    </div>
  );
}
