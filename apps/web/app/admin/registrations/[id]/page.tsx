import { notFound } from "next/navigation";
import { getRegistrationById } from "@/lib/queries/registrations";
import { getDocsForEntity } from "@/lib/entities/entityDocsMap";
import { getStateFilingForRegistration } from "@/lib/queries/stateFilings";
import { buildFilingWorksheet } from "@/lib/state-filing/worksheet";
import { getRegisteredAgentOrderForRegistration } from "@/lib/queries/registeredAgent";
import { buildRegisteredAgentOrderPacket } from "@/lib/registered-agent/worksheet";
import { getIrsFilingForRegistration } from "@/lib/queries/irsFilings";
import { getAllContractors } from "@/lib/queries/contractors";
import { entityFamily } from "@/lib/entities/entityFamily";
import DownloadButton from "@/components/dashboard/DownloadButton";
import AdminRegDetailForm from "@/components/admin/AdminRegDetailForm";
import StateFilingPanel from "@/components/admin/StateFilingPanel";
import RegisteredAgentPanel from "@/components/admin/RegisteredAgentPanel";
import IrsFilingPanel from "@/components/admin/IrsFilingPanel";

export default async function AdminRegistrationDetailPage({ params }: { params: { id: string } }) {
  const reg = await getRegistrationById(params.id);
  if (!reg) notFound();

  const docs = getDocsForEntity(reg.entity_type);
  const address = reg.address as { address?: string; city?: string; zip?: string } | null;
  const stateFiling = await getStateFilingForRegistration(reg.id);
  const registeredAgentOrder = await getRegisteredAgentOrderForRegistration(reg.id);
  const irsFiling = entityFamily(reg.entity_type) === "nonprofit" ? await getIrsFilingForRegistration(reg.id) : null;
  const contractors = await getAllContractors();
  const activeContractors = contractors.filter((c) => c.status === "active");

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">{reg.orgname}</h1>
        <p className="text-gray-400 text-sm">{reg.id}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Entity Type</span>
          <div className="font-medium text-navy">{reg.entity_type}</div>
        </div>
        <div>
          <span className="text-gray-400">State</span>
          <div className="font-medium text-navy">{reg.state}</div>
        </div>
        <div>
          <span className="text-gray-400">Plan</span>
          <div className="font-medium text-navy">{reg.plan}</div>
        </div>
        <div>
          <span className="text-gray-400">Amount</span>
          <div className="font-medium text-navy">${(reg.amount_cents / 100).toFixed(2)}</div>
        </div>
        <div>
          <span className="text-gray-400">Contact</span>
          <div className="font-medium text-navy">
            {reg.contact_name} —{" "}
            <a href={`mailto:${reg.contact_email}`} className="text-teal">
              {reg.contact_email}
            </a>
          </div>
        </div>
        <div>
          <span className="text-gray-400">Address</span>
          <div className="font-medium text-navy">
            {address?.address}, {address?.city} {address?.zip}
          </div>
        </div>
      </div>

      <AdminRegDetailForm id={reg.id} status={reg.status} adminNotes={reg.admin_notes ?? ""} />

      {stateFiling && (
        <StateFilingPanel filing={stateFiling} worksheet={buildFilingWorksheet(reg)} contractors={activeContractors} />
      )}

      {registeredAgentOrder && (
        <RegisteredAgentPanel
          order={registeredAgentOrder}
          packet={buildRegisteredAgentOrderPacket(reg)}
          contractors={activeContractors}
        />
      )}

      {irsFiling && <IrsFilingPanel filing={irsFiling} />}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
        <div className="font-semibold text-navy mb-4">Documents ({docs.length})</div>
        <div className="flex flex-col gap-2">
          {docs.map((doc) => (
            <div key={doc.key} className="flex items-center justify-between text-sm">
              <span>
                {doc.icon} {doc.title}
              </span>
              <DownloadButton href={`/api/documents/registration/${reg.id}?key=${doc.key}`}>Download</DownloadButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
