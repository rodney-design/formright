import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getContractorByUserId, getChecklistItemsForStateFiling, ensureChecklistForStateFiling } from "@/lib/queries/contractors";
import { getStateFilingById } from "@/lib/queries/stateFilings";
import { getRegistrationById } from "@/lib/queries/registrations";
import { buildFilingWorksheet } from "@/lib/state-filing/worksheet";
import ChecklistPanel from "@/components/contractor/ChecklistPanel";
import StateFilingContractorForm from "@/components/contractor/StateFilingContractorForm";

export default async function ContractorStateFilingDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const contractor = await getContractorByUserId(user!.id);
  const filing = await getStateFilingById(params.id);

  if (!contractor || !filing || filing.assigned_contractor_id !== contractor.id) {
    notFound();
  }

  const reg = await getRegistrationById(filing.registration_id);
  if (!reg) notFound();

  await ensureChecklistForStateFiling(filing.id);
  const checklist = await getChecklistItemsForStateFiling(filing.id);
  const worksheet = buildFilingWorksheet(reg);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">{reg.orgname}</h1>
        <p className="text-gray-400 text-sm">
          {worksheet.state} · {worksheet.entityType}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="font-semibold text-navy mb-4">Filing Worksheet</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-gray-50 rounded-xl p-4">
          {worksheet.fields.map((f) => (
            <div key={f.label}>
              <span className="text-gray-400 text-xs">{f.label}</span>
              <div className="text-navy font-medium">{f.value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="font-semibold text-navy mb-4">Checklist</div>
        <ChecklistPanel items={checklist} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="font-semibold text-navy mb-4">Update Status</div>
        <StateFilingContractorForm filing={filing} />
      </div>
    </div>
  );
}
