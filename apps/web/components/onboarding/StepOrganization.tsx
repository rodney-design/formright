"use client";

import { useState } from "react";
import { useOnboardStore } from "@/lib/store/onboardStore";
import { STATE_FEES } from "@/lib/entities/stateFees";
import { ENTITY_TYPE_OPTIONS } from "@/lib/data/entityTypeOptions";
import { entityFamily } from "@/lib/entities/entityFamily";
import { Field, TextInput, Select, FormGrid, FormActions } from "./fields";
import { Button } from "@/components/ui/Button";

const STATES = Object.keys(STATE_FEES);

// California Nonprofit Corporation Law (Corp. Code Div. 2) splits nonprofits
// into 3 statutory sub-types with distinct required Articles language — see
// db/migrations/013_nonprofit_statutes.sql for the source citations. Shown
// only for CA + a nonprofit entity type; every other state's nonprofit law
// doesn't make this distinction, so there's nothing to ask there.
const CA_SUBTYPE_OPTIONS: { value: "public_benefit" | "mutual_benefit" | "religious"; label: string }[] = [
  { value: "public_benefit", label: "Public Benefit (charitable, educational — most 501(c)(3) orgs)" },
  { value: "mutual_benefit", label: "Mutual Benefit (business league, social club — 501(c)(6)/(c)(7))" },
  { value: "religious", label: "Religious Corporation" },
];

export default function StepOrganization() {
  const s = useOnboardStore();
  const [attempted, setAttempted] = useState(false);
  const showCaSubtype = s.state === "California" && entityFamily(s.orgtype) === "nonprofit";

  const fieldInvalid = {
    orgname: !s.orgname.trim(),
    orgtype: !s.orgtype,
    state: !s.state,
    address: !s.address.trim(),
    city: !s.city.trim(),
  };
  const errors = attempted ? fieldInvalid : ({} as Record<string, boolean>);

  function next() {
    setAttempted(true);
    if (Object.values(fieldInvalid).some(Boolean)) return;
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
        {showCaSubtype && (
          <Field
            label="California Nonprofit Corporation Type"
            full
            hint="Required by California's Nonprofit Corporation Law — determines the exact statutory language in your Articles (Corp. Code §§ 5130/7130/9130)."
          >
            <Select
              value={s.caNonprofitSubtype}
              onChange={(e) => s.setField("caNonprofitSubtype", e.target.value as typeof s.caNonprofitSubtype)}
            >
              <option value="">Use default for my entity type</option>
              {CA_SUBTYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </FormGrid>
      <FormActions stepLabel="Step 1 of 6">
        <Button onClick={next}>Continue →</Button>
      </FormActions>
    </div>
  );
}
