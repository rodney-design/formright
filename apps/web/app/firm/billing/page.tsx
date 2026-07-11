import { requireFirmMembership, countActiveFirmMembers } from "@/lib/queries/firms";
import { getFirmSubscription } from "@/lib/queries/firmSubscriptions";
import ProSeatsSubscribeButton from "@/components/firm/ProSeatsSubscribeButton";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export default async function FirmBillingPage() {
  const { membership } = await requireFirmMembership();
  const [subscription, seats] = await Promise.all([
    getFirmSubscription(membership.firm.id),
    countActiveFirmMembers(membership.firm.id),
  ]);
  const active = subscription ? ACTIVE_STATUSES.has(subscription.status) : false;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Per-seat billing for {membership.firm.name}.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-semibold text-navy">Team seats</div>
          <p className="text-sm text-gray-500 mt-1">{seats} active team member{seats === 1 ? "" : "s"}</p>
          {subscription && (
            <p className="text-xs text-gray-400 mt-2">
              Status: <span className="font-medium">{subscription.status}</span> · {subscription.seats} seat
              {subscription.seats === 1 ? "" : "s"} billed
              {subscription.renews_at && ` · Renews ${new Date(subscription.renews_at).toLocaleDateString()}`}
            </p>
          )}
        </div>
        {active ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-pale text-teal border border-teal/20 shrink-0">
            Active
          </span>
        ) : (
          <div className="shrink-0">
            <ProSeatsSubscribeButton />
          </div>
        )}
      </div>
    </div>
  );
}
