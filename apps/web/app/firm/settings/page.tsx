import { requireFirmMembership } from "@/lib/queries/firms";
import FirmSettingsForm from "@/components/firm/FirmSettingsForm";

export default async function FirmSettingsPage() {
  const { membership } = await requireFirmMembership();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">Branding</h1>
        <p className="text-gray-500 text-sm mt-1">
          White-label your clients&apos; formation documents.
        </p>
      </div>

      {membership.role === "firm_admin" ? (
        <FirmSettingsForm firm={membership.firm} />
      ) : (
        <p className="text-gray-500 text-sm">Only firm admins can edit branding settings.</p>
      )}
    </div>
  );
}
