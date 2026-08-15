"use client";

import { useOnboardStore, type OnboardState } from "@/lib/store/onboardStore";
import { evalIrs } from "@/lib/entities/evalIrs";
import { getNonprofitSubtype, isNonprofitFamily } from "@/lib/entities/nonprofitSubtype";
import { FormActions } from "./fields";
import { Button } from "@/components/ui/Button";

const QUESTIONS: { key: keyof OnboardState["irs"]; question: string; noLabel: string; yesLabel: string }[] = [
  {
    key: "gross",
    question: "Will your annual gross receipts exceed $50,000 in any of the next 3 years?",
    noLabel: "No — under $50,000",
    yesLabel: "Yes — over $50,000",
  },
  {
    key: "assets",
    question: "Will your total assets exceed $250,000?",
    noLabel: "No — under $250,000",
    yesLabel: "Yes — over $250,000",
  },
  {
    key: "church",
    question: "Is your organization a church, school, or hospital?",
    noLabel: "No",
    yesLabel: "Yes",
  },
  {
    key: "revoked",
    question: "Has the organization or a predecessor had its tax-exempt status revoked?",
    noLabel: "No",
    yesLabel: "Yes",
  },
];

export default function StepIrsScreening() {
  const s = useOnboardStore();
  const family = s.entityFamily();
  const result = evalIrs(s.irs);

  // 1023/1023-EZ eligibility only applies to 501(c)(3). Form 8976 (c4) and
  // Form 1024 (c6/c7) don't have a comparable receipts/assets eligibility
  // test, so those subtypes get filing guidance instead of a screening quiz.
  if (isNonprofitFamily(family) && family !== "nonprofit") {
    const subtype = getNonprofitSubtype(family);
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-navy">IRS Filing Guidance</h2>
          <p className="text-gray-500 text-sm mt-1">
            How {subtype.label} organizations apply for IRS recognition.
          </p>
        </div>

        <div className="rounded-xl border border-teal/20 bg-teal-pale p-4 text-sm text-teal flex gap-3">
          <span className="text-lg">ℹ️</span>
          <div>
            <strong>{subtype.filingForm}.</strong> {subtype.filingGuidance}
          </div>
        </div>

        <FormActions onBack={() => s.goToStep(4)} stepLabel="Step 5 of 6">
          <Button onClick={() => s.goToStep(6)}>Continue →</Button>
        </FormActions>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-navy">IRS Eligibility Screening</h2>
        <p className="text-gray-500 text-sm mt-1">A few questions to determine the best filing path for you.</p>
      </div>

      <div className="flex flex-col gap-6">
        {QUESTIONS.map((q) => (
          <div key={q.key}>
            <div className="text-sm font-semibold text-navy mb-2.5">{q.question}</div>
            <div className="flex gap-2.5">
              {(["no", "yes"] as const).map((val) => (
                <label
                  key={val}
                  className={`flex-1 border-[1.5px] rounded-lg p-3.5 flex items-center gap-2.5 cursor-pointer text-sm transition-colors ${
                    s.irs[q.key] === val ? "border-teal" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.key}
                    value={val}
                    checked={s.irs[q.key] === val}
                    onChange={() => s.setIrsAnswer(q.key, val)}
                    className="accent-teal"
                  />
                  <span>{val === "no" ? q.noLabel : q.yesLabel}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {result.status !== "unanswered" && (
        <div
          className={`mt-6 rounded-xl p-4 flex gap-3 text-sm ${
            result.status === "disqualified"
              ? "bg-amber-50 border border-amber-300 text-amber-800"
              : "bg-teal-pale border border-teal/20 text-teal"
          }`}
        >
          <span className="text-lg">{result.status === "disqualified" ? "⚠️" : "✅"}</span>
          <div>
            {result.status === "disqualified" ? (
              <>
                <strong>Full Form 1023 Required.</strong> Based on your answers (
                {result.reasons.join("; ")}), your organization does not qualify for the 1023-EZ
                streamlined application. We recommend our <strong>Full 1023 Long-Form</strong>{" "}
                service.
              </>
            ) : (
              <>
                <strong>You likely qualify for Form 1023-EZ.</strong> Based on your answers so far,
                the streamlined application applies — significantly reducing filing time and
                complexity. We recommend our <strong>Full-Service 1023-EZ</strong> plan.
              </>
            )}
          </div>
        </div>
      )}

      <FormActions onBack={() => s.goToStep(4)} stepLabel="Step 5 of 6">
        <Button onClick={() => s.goToStep(6)}>Continue →</Button>
      </FormActions>
    </div>
  );
}
