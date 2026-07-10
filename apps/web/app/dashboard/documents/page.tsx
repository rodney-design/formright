import { getCurrentUser } from "@/lib/auth";
import { getRegistrationsForUser } from "@/lib/queries/registrations";
import { getDocsForEntity } from "@/lib/entities/entityDocsMap";
import DownloadButton from "@/components/dashboard/DownloadButton";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  const registrations = await getRegistrationsForUser(user!.id);
  const active = registrations[0];

  if (!active) {
    return <p className="text-gray-500">No registration found yet.</p>;
  }

  const docs = getDocsForEntity(active.entity_type);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy">Document Package</h1>
          <p className="text-gray-500 text-sm mt-1">{docs.length} documents ready for {active.orgname}</p>
        </div>
        <DownloadButton href={`/api/documents/${active.id}?all=1`} variant="dark">
          ⬇ Download All (.zip)
        </DownloadButton>
      </div>

      <div className="flex flex-col gap-2">
        {docs.map((doc) => (
          <div
            key={doc.key}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-pale flex items-center justify-center text-lg shrink-0">
              {doc.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-navy">{doc.title}</div>
              <div className="text-xs text-gray-400">{doc.desc}</div>
            </div>
            <DownloadButton href={`/api/documents/${active.id}?key=${doc.key}`}>⬇ Download</DownloadButton>
          </div>
        ))}
      </div>
    </div>
  );
}
