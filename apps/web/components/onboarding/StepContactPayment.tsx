"use client";

import { useState } from "react";
import { useOnboardStore } from "@/lib/store/onboardStore";
import { ADDONS, getPlansForEntity } from "@/lib/entities/pricing";
import { getStateFee } from "@/lib/entities/stateFees";
import { Field, TextInput, FormActions } from "./fields";
import { Button } from "@/components/ui/Button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function StepContactPayment({
  submitting,
  setSubmitting,
}: {
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
}) {
  const s = useOnboardStore();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const family = s.entityFamily();
  const plans = getPlansForEntity(family);
  const defaultPlan = plans.find((p) => p.featured) ?? plans[0];
  const selectedPlan = plans.find((p) => p.key === s.selectedPlanKey) ?? defaultPlan;
  const oneTimeAddons = ADDONS.filter((a) => !a.recurring);
  const stateFeeCents = getStateFee(s.state) ? getStateFee(s.state)! * 100 : 0;
  const addonsCents = oneTimeAddons
    .filter((a) => s.addonKeys.has(a.key))
    .reduce((sum, a) => sum + a.priceCents, 0);
  const totalCents = (selectedPlan?.priceCents ?? 0) + stateFeeCents + addonsCents;

  async function submit() {
    const emailOk = EMAIL_RE.test(s.email);
    const nextErrors = { fname: !s.fname.trim(), lname: !s.lname.trim(), email: !emailOk };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    if (!selectedPlan || selectedPlan.priceCents === null) {
      setSubmitError("Please select a plan to continue.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgname: s.orgname,
          orgtype: s.orgtype,
          state: s.state,
          fiscal: s.fiscal,
          address: s.address,
          city: s.city,
          zip: s.zip,
          ein: s.ein,
          mission: s.mission,
          programs: s.programs,
          geoArea: s.geoArea,
          beneficiaries: s.beneficiaries,
          revenue: s.revenue,
          caNonprofitSubtype: s.caNonprofitSubtype,
          board: s.board,
          registeredAgentName: s.registeredAgentName,
          registeredAgentAddress: s.registeredAgentAddress,
          governance: {
            meetingFrequency: s.meetingFrequency,
            quorum: s.quorum,
            termLength: s.termLength,
            termLimits: s.termLimits,
            compensationPolicy: s.compensationPolicy,
            dissolutionClause: s.dissolutionClause,
            policies: s.policies,
          },
          irs: s.irs,
          fname: s.fname,
          lname: s.lname,
          email: s.email,
          phone: s.phone,
          planKey: selectedPlan.key,
          addonKeys: Array.from(s.addonKeys),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Checkout failed");
      window.location.href = json.url;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong, please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-navy">Contact & Choose Your Plan</h2>
        <p className="text-gray-500 text-sm mt-1">Almost done! Create your account and select your formation plan.</p>
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Your Account</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <Field label="First Name" required error={errors.fname ? "Required" : undefined}>
          <TextInput value={s.fname} onChange={(e) => s.setField("fname", e.target.value)} placeholder="Jane" />
        </Field>
        <Field label="Last Name" required error={errors.lname ? "Required" : undefined}>
          <TextInput value={s.lname} onChange={(e) => s.setField("lname", e.target.value)} placeholder="Smith" />
        </Field>
        <Field label="Email Address" required error={errors.email ? "Valid email required" : undefined}>
          <TextInput type="email" value={s.email} onChange={(e) => s.setField("email", e.target.value)} placeholder="jane@example.org" />
        </Field>
        <Field label="Phone Number">
          <TextInput type="tel" value={s.phone} onChange={(e) => s.setField("phone", e.target.value)} placeholder="(555) 000-0000" />
        </Field>
      </div>
      <p className="text-xs text-gray-400 -mt-5 mb-8">
        No password needed — after payment you&apos;ll sign in with a secure email link.
      </p>

      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Select Your Plan</div>
      <div className="flex flex-col gap-3 mb-6">
        {plans.map((plan) => {
          const active = (s.selectedPlanKey ?? defaultPlan?.key) === plan.key;
          return (
            <label
              key={plan.key}
              onClick={() => s.selectPlan(plan.key)}
              className={`border-2 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer transition-colors ${
                active ? "border-gold bg-yellow-pale" : "border-gray-200"
              }`}
            >
              <input type="radio" name="plan" checked={active} readOnly className="accent-teal" />
              <div className="flex-1">
                <div className="font-semibold text-sm text-navy">
                  {plan.name}
                  {plan.featured && (
                    <span className="ml-2 text-[10px] font-bold uppercase bg-gold text-navy px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">{plan.description}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif font-bold text-lg text-navy">
                  {plan.priceCents === null ? "Custom" : `$${formatCents(plan.priceCents)}`}
                </div>
                <div className="text-[10px] text-gray-400">+ state fee</div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Add-Ons</div>
      <div className="flex gap-3 flex-wrap mb-2">
        {oneTimeAddons.map((addon) => (
          <label
            key={addon.key}
            className="border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2.5 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              checked={s.addonKeys.has(addon.key)}
              onChange={() => s.toggleAddon(addon.key)}
              className="accent-teal"
            />
            {addon.name} (${formatCents(addon.priceCents)}
            {addon.cadence})
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-8">
        FormRight Comply ($149/yr) is a subscription — add it from your dashboard after formation.
      </p>

      <div className="bg-gray-50 border-[1.5px] border-gray-200 rounded-xl p-5">
        <div className="font-bold text-navy text-sm uppercase tracking-wide mb-3.5">Order Summary</div>
        <div className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
          <span>FormRight service fee</span>
          <span className="font-semibold">
            {selectedPlan?.priceCents === null || selectedPlan === undefined
              ? "—"
              : `$${formatCents(selectedPlan.priceCents)}`}
          </span>
        </div>
        {s.state && stateFeeCents > 0 ? (
          <div className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
            <span>{s.state} state filing fee</span>
            <span className="font-semibold">${formatCents(stateFeeCents)}</span>
          </div>
        ) : (
          <div className="flex justify-between py-1.5 border-b border-gray-100 text-sm text-gray-400">
            <span>State filing fee</span>
            <span>Select state in Step 1</span>
          </div>
        )}
        {Array.from(s.addonKeys).map((key) => {
          const addon = ADDONS.find((a) => a.key === key);
          if (!addon) return null;
          return (
            <div key={key} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
              <span>{addon.name}</span>
              <span className="font-semibold">${formatCents(addon.priceCents)}</span>
            </div>
          );
        })}
        <div className="flex justify-between pt-3 text-lg">
          <span className="font-bold text-navy">Total due today</span>
          <span className="font-extrabold text-teal">${formatCents(totalCents)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        State filing fees are collected by FormRight and remitted directly to your state&apos;s
        Secretary of State on your behalf. Fees shown are current as of 2026 and subject to change
        by the state.
      </p>

      {submitError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <FormActions onBack={() => s.goToStep(5)} stepLabel="Step 6 of 6">
        <Button onClick={submit} disabled={submitting}>
          {submitting ? "Redirecting to payment…" : `Pay $${formatCents(totalCents)} & Submit →`}
        </Button>
      </FormActions>
    </div>
  );
}
