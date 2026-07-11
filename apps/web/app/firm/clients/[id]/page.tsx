import { notFound } from "next/navigation";
import { requireFirmMembership } from "@/lib/queries/firms";
import { getRegistrationById } from "@/lib/queries/registrations";
import { getDocsForEntity } from "@/lib/entities/entityDocsMap";
import DownloadButton from "@/components/dashboard/DownloadButton";
import StatusBadge from "@/components/dashboard/StatusBadge";

export default async function FirmClientDetailPage({ params }: { params: { id: string } }) {
  const { membership } = await requireFirmMembership();
  const reg = await getRegistrationById(params.id);
  if (!reg || reg.firm_id !== membership.firm.id) notFound();

  const docs = getDocsForEntity(reg.entity_type);
  const address = reg.address as { address?: string; city?: string; zip?: string } | null;

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy">{reg.orgname}</h1>
          <p className="text-gray-400 text-sm">{reg.id}</p>
        </div>
        <StatusBadge status={reg.status} />
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

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
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
