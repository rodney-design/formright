import { requireFirmMembership } from "@/lib/queries/firms";
import { getRegistrationsForFirm } from "@/lib/queries/registrations";
import FirmClientTable from "@/components/firm/FirmClientTable";

export default async function FirmClientsPage() {
  const { membership } = await requireFirmMembership();
  const registrations = await getRegistrationsForFirm(membership.firm.id);

  const inProgress = registrations.filter((r) => ["pending", "paid", "in_review", "filed"].includes(r.status)).length;
  const completed = registrations.filter((r) => r.status === "complete").length;

  const stats = [
    { label: "Total Clients", value: String(registrations.length) },
    { label: "In Progress", value: String(inProgress) },
    { label: "Completed", value: String(completed) },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">{membership.firm.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Your formations, in one place.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{s.label}</div>
            <div className="text-2xl font-serif font-bold text-navy">{s.value}</div>
          </div>
        ))}
      </div>

      <FirmClientTable registrations={registrations} />
    </div>
  );
}
