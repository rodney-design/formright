import { requireFirmMembership } from "@/lib/queries/firms";
import { listApiKeysForFirm } from "@/lib/queries/apiKeys";
import ApiKeysManager from "@/components/firm/ApiKeysManager";

export default async function FirmApiKeysPage() {
  const { membership } = await requireFirmMembership();
  const keys = await listApiKeysForFirm(membership.firm.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">API Keys</h1>
        <p className="text-gray-500 text-sm mt-1">
          Authenticate REST API v1 requests with <code>Authorization: Bearer &lt;key&gt;</code>.
          See <code>/api/v1/formations</code>, <code>/api/v1/documents</code>,{" "}
          <code>/api/v1/status</code>.
        </p>
      </div>
      <ApiKeysManager initialKeys={keys} isAdmin={membership.role === "firm_admin"} />
    </div>
  );
}
