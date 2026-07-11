import { query } from "@/lib/db";
import CreateFirmForm from "@/components/admin/CreateFirmForm";

interface FirmRow {
  id: string;
  name: string;
  created_at: string;
  member_count: string;
  client_count: string;
}

export default async function AdminFirmsPage() {
  const result = await query<FirmRow>(
    `SELECT f.id, f.name, f.created_at,
            (SELECT COUNT(*) FROM firm_members fm WHERE fm.firm_id = f.id AND fm.joined_at IS NOT NULL) AS member_count,
            (SELECT COUNT(*) FROM registrations r WHERE r.firm_id = f.id) AS client_count
     FROM firms f
     ORDER BY f.created_at DESC`
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">Pro Firms</h1>
      </div>

      <div className="mb-8">
        <CreateFirmForm />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 font-medium">Firm</th>
              <th className="px-6 py-3 font-medium">Members</th>
              <th className="px-6 py-3 font-medium">Clients</th>
              <th className="px-6 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((f) => (
              <tr key={f.id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-navy">{f.name}</td>
                <td className="px-6 py-3 text-gray-600">{f.member_count}</td>
                <td className="px-6 py-3 text-gray-600">{f.client_count}</td>
                <td className="px-6 py-3 text-gray-600">{new Date(f.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {result.rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                  No firms yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
