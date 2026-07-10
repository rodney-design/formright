import { getCurrentUser } from "@/lib/auth";
import { getRegistrationsForUser } from "@/lib/queries/registrations";
import StatusBadge from "@/components/dashboard/StatusBadge";

const TIMELINE_STEPS = [
  { key: "pending", label: "Registration submitted" },
  { key: "paid", label: "Payment confirmed" },
  { key: "in_review", label: "Documents under review" },
  { key: "filed", label: "Filed with Secretary of State" },
  { key: "complete", label: "Formation complete" },
];

function stepIndex(status: string) {
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default async function FilingStatusPage() {
  const user = await getCurrentUser();
  const registrations = await getRegistrationsForUser(user!.id);
  const active = registrations[0];

  if (!active) {
    return <p className="text-gray-500">No registration found yet.</p>;
  }

  const currentIndex = stepIndex(active.status);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-navy">📊 Filing Status</h1>
        <p className="text-gray-500 text-sm mt-1">Track every step of your formation.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="font-semibold text-navy">Formation Timeline</div>
          <StatusBadge status={active.status} />
        </div>
        <ol className="flex flex-col gap-4">
          {TIMELINE_STEPS.map((step, i) => (
            <li key={step.key} className="flex items-center gap-3 text-sm">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  i <= currentIndex ? "bg-teal text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {i <= currentIndex ? "✓" : i + 1}
              </span>
              <span className={i <= currentIndex ? "text-navy font-medium" : "text-gray-400"}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="font-semibold text-navy mb-4">Filing Details</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div>
            <span className="text-gray-400">Registration ID</span>
            <div className="font-medium text-navy">{active.id}</div>
          </div>
          <div>
            <span className="text-gray-400">State</span>
            <div className="font-medium text-navy">{active.state}</div>
          </div>
          <div>
            <span className="text-gray-400">Plan</span>
            <div className="font-medium text-navy">{active.plan}</div>
          </div>
          <div>
            <span className="text-gray-400">EIN</span>
            <div className="font-medium text-navy">{active.ein || "Pending"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
