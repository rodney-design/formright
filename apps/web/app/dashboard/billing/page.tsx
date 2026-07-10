import { getCurrentUser } from "@/lib/auth";
import { getPaymentsForUser, getRegistrationsForUser } from "@/lib/queries/registrations";
import { getSubscriptionsForUser } from "@/lib/queries/subscriptions";
import ComplySubscribeButton from "@/components/dashboard/ComplySubscribeButton";

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export default async function BillingPage() {
  const user = await getCurrentUser();
  const [payments, registrations, subscriptions] = await Promise.all([
    getPaymentsForUser(user!.id),
    getRegistrationsForUser(user!.id),
    getSubscriptionsForUser(user!.id),
  ]);
  const regById = new Map(registrations.map((r) => [r.id, r]));
  const comply = subscriptions.find((s) => s.plan === "comply");
  const complyActive = comply ? ACTIVE_STATUSES.has(comply.status) : false;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-navy">💳 Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Your payment history and active plans.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-semibold text-navy">FormRight Comply</div>
          <p className="text-sm text-gray-500 mt-1">
            Compliance calendar · Document vault · Deadline alerts · Annual report reminders
          </p>
          {comply && (
            <p className="text-xs text-gray-400 mt-2">
              Status: <span className="font-medium">{comply.status}</span>
              {comply.renews_at &&
                ` · Renews ${new Date(comply.renews_at).toLocaleDateString()}`}
            </p>
          )}
        </div>
        {complyActive ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-pale text-teal border border-teal/20 shrink-0">
            Active
          </span>
        ) : (
          <div className="shrink-0">
            <ComplySubscribeButton />
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-navy">Payment History</div>
        {payments.length === 0 ? (
          <div className="px-6 py-8 text-sm text-gray-400 text-center">
            No payments yet. Charges will appear here once a formation is paid for.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Organization</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-navy font-medium">
                    {regById.get(p.registration_id)?.orgname ?? p.registration_id}
                  </td>
                  <td className="px-6 py-3 text-navy">{formatCents(p.amount_cents)}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-pale text-teal border border-teal/20">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
