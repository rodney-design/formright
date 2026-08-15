import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-navy">⚙️ Settings</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="font-semibold text-navy mb-4">Profile</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Name</span>
            <div className="font-medium text-navy">{user?.name || "—"}</div>
          </div>
          <div>
            <span className="text-gray-400">Email</span>
            <div className="font-medium text-navy">{user?.email}</div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          FormRight uses passwordless sign-in — there&apos;s no password to manage. To change your
          email, contact support.
        </p>
      </div>

      <div className="bg-white border border-red-200 rounded-2xl p-6">
        <div className="font-semibold text-red-600 mb-3">Danger Zone</div>
        <div className="flex justify-between items-center text-sm">
          <div>
            <div className="font-medium text-navy">Delete Account</div>
            <div className="text-gray-500 mt-0.5">
              Permanently delete your account and all data. Contact support to request deletion.
            </div>
          </div>
          <a
            href="mailto:support@formright.org"
            className="bg-red-50 text-red-600 rounded-lg px-4 py-2 text-xs font-semibold shrink-0"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
