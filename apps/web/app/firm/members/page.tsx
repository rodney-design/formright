import { requireFirmMembership, getFirmMembers } from "@/lib/queries/firms";
import InviteMemberForm from "@/components/firm/InviteMemberForm";
import RemoveMemberButton from "@/components/firm/RemoveMemberButton";

export default async function FirmMembersPage() {
  const { membership } = await requireFirmMembership();
  const members = await getFirmMembers(membership.firm.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">Team</h1>
        <p className="text-gray-500 text-sm mt-1">Who has access to {membership.firm.name}&apos;s clients.</p>
      </div>

      {membership.role === "firm_admin" && <InviteMemberForm />}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 font-medium">Member</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              {membership.role === "firm_admin" && <th className="px-6 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="px-6 py-3">
                  <div className="font-medium text-navy">{m.name || m.email}</div>
                  <div className="text-xs text-gray-400">{m.email}</div>
                </td>
                <td className="px-6 py-3 text-gray-600">{m.role === "firm_admin" ? "Admin" : "Member"}</td>
                <td className="px-6 py-3">
                  {m.joined_at ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-pale text-teal border border-teal/20">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Invited
                    </span>
                  )}
                </td>
                {membership.role === "firm_admin" && (
                  <td className="px-6 py-3">
                    <RemoveMemberButton memberId={m.id} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
