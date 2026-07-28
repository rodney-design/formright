import Link from "next/link";
import { requireContractor } from "@/lib/auth";
import { getContractorByUserId, getJobsForContractor, getPendingPayoutTotalCents } from "@/lib/queries/contractors";
import RegisteredAgentOrderQuickUpdate from "@/components/contractor/RegisteredAgentOrderQuickUpdate";
import type { RegisteredAgentStatus } from "@/lib/registered-agent/status";

export default async function ContractorJobsPage() {
  const user = await requireContractor();
  const contractor = await getContractorByUserId(user.id);

  if (!contractor) {
    return <p className="text-gray-500">No contractor profile found for this account.</p>;
  }

  const jobs = await getJobsForContractor(contractor.id);
  const pendingPayoutCents = await getPendingPayoutTotalCents(contractor.id);
  const stateFilingJobs = jobs.filter((j) => j.kind === "state_filing");
  const registeredAgentJobs = jobs.filter((j) => j.kind === "registered_agent_order");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-navy">My Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">
          States covered: {contractor.states_covered.length > 0 ? contractor.states_covered.join(", ") : "none set"} · Pending
          payout: ${(pendingPayoutCents / 100).toFixed(2)}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="font-semibold text-navy mb-4">State Filings ({stateFilingJobs.length})</div>
        {stateFilingJobs.length === 0 ? (
          <p className="text-sm text-gray-400">No state filings assigned to you.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {stateFilingJobs.map((job) => (
              <Link
                key={job.id}
                href={`/contractor/state-filings/${job.id}`}
                className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-4 py-3 hover:border-teal"
              >
                <span className="font-medium text-navy">
                  {job.orgname} — {job.state}
                </span>
                <span className="text-gray-400">{job.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="font-semibold text-navy mb-4">Registered Agent Orders ({registeredAgentJobs.length})</div>
        {registeredAgentJobs.length === 0 ? (
          <p className="text-sm text-gray-400">No registered agent orders assigned to you.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {registeredAgentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-4 py-3">
                <span className="font-medium text-navy">
                  {job.orgname} — {job.state}
                </span>
                <RegisteredAgentOrderQuickUpdate orderId={job.id} status={job.status as RegisteredAgentStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
