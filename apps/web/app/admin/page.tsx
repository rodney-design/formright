import { getAllRegistrations } from "@/lib/queries/registrations";
import AdminPipelineTable from "@/components/admin/AdminPipelineTable";

export default async function AdminPipelinePage() {
  const registrations = await getAllRegistrations();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenueMtdCents = registrations
    .filter((r) => r.status === "paid" && new Date(r.created_at) >= monthStart)
    .reduce((sum, r) => sum + r.amount_cents, 0);
  const inProgress = registrations.filter((r) => ["pending", "paid", "in_review", "filed"].includes(r.status)).length;
  const completed = registrations.filter((r) => r.status === "complete").length;
  const needsReview = registrations.filter((r) => r.status === "payment_failed").length;

  const stats = [
    { label: "Total Clients", value: String(registrations.length) },
    { label: "Revenue (MTD)", value: `$${(revenueMtdCents / 100).toLocaleString()}` },
    { label: "In Progress", value: String(inProgress) },
    { label: "Completed", value: String(completed) },
    { label: "Needs Review", value: String(needsReview), warn: needsReview > 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">Organization Pipeline</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{s.label}</div>
            <div className={`text-2xl font-serif font-bold ${s.warn ? "text-amber-600" : "text-navy"}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <AdminPipelineTable registrations={registrations} />
    </div>
  );
}
