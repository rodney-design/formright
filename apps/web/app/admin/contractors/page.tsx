import Link from "next/link";
import { getAllContractors, getJobsForContractor, getPendingPayoutTotalCents } from "@/lib/queries/contractors";
import AddContractorForm from "@/components/admin/AddContractorForm";

export default async function AdminContractorsPage() {
  const contractors = await getAllContractors();

  const rows = await Promise.all(
    contractors.map(async (c) => ({
      contractor: c,
      jobCount: (await getJobsForContractor(c.id)).length,
      pendingPayoutCents: await getPendingPayoutTotalCents(c.id),
    }))
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">Contractors</h1>
      </div>

      <AddContractorForm />

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">States</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Jobs</th>
              <th className="text-left px-4 py-3">Pending Payout</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ contractor, jobCount, pendingPayoutCents }) => (
              <tr key={contractor.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/contractors/${contractor.id}`} className="text-teal font-medium">
                    {contractor.name || "(no name)"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-navy">{contractor.email}</td>
                <td className="px-4 py-3 text-navy">{contractor.states_covered.join(", ") || "—"}</td>
                <td className="px-4 py-3 text-navy capitalize">{contractor.status}</td>
                <td className="px-4 py-3 text-navy">{jobCount}</td>
                <td className="px-4 py-3 text-navy">${(pendingPayoutCents / 100).toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No contractors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
