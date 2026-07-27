import { notFound } from "next/navigation";
import { getContractorById, getJobsForContractor, getPayoutsForContractor } from "@/lib/queries/contractors";
import ContractorStatusToggle from "@/components/admin/ContractorStatusToggle";
import ContractorPayoutsPanel from "@/components/admin/ContractorPayoutsPanel";

export default async function AdminContractorDetailPage({ params }: { params: { id: string } }) {
  const contractor = await getContractorById(params.id);
  if (!contractor) notFound();

  const jobs = await getJobsForContractor(contractor.id);
  const payouts = await getPayoutsForContractor(contractor.id);

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy">{contractor.name || contractor.email}</h1>
          <p className="text-gray-400 text-sm">{contractor.email}</p>
        </div>
        <ContractorStatusToggle contractorId={contractor.id} status={contractor.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="font-semibold text-navy mb-4">Assigned Jobs ({jobs.length})</div>
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <div key={`${job.kind}-${job.id}`} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-4 py-3">
              <span className="font-medium text-navy">
                {job.orgname} — {job.state} ({job.kind === "state_filing" ? "State Filing" : "Registered Agent"})
              </span>
              <span className="text-gray-400">{job.status}</span>
            </div>
          ))}
          {jobs.length === 0 && <p className="text-sm text-gray-400">No jobs assigned yet.</p>}
        </div>
      </div>

      <ContractorPayoutsPanel contractorId={contractor.id} payouts={payouts} />
    </div>
  );
}
