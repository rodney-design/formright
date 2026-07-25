import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getRegistrationsForUser } from "@/lib/queries/registrations";
import { getSubscriptionsForUser } from "@/lib/queries/subscriptions";
import { getDocsForEntity } from "@/lib/entities/entityDocsMap";
import { entityFamily } from "@/lib/entities/entityFamily";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ComplyNudgeBanner from "@/components/dashboard/ComplyNudgeBanner";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export default async function DashboardHome() {
  const user = await getCurrentUser();
  const [registrations, subscriptions] = await Promise.all([
    getRegistrationsForUser(user!.id),
    getSubscriptionsForUser(user!.id),
  ]);
  const active = registrations[0];
  const complyActive = subscriptions.some((s) => s.plan === "comply" && ACTIVE_STATUSES.has(s.status));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-navy">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s where your formation stands.</p>
      </div>

      {active && !complyActive && <ComplyNudgeBanner />}

      {!active ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-500 mb-4">You don&apos;t have any registrations yet.</p>
          <Link href="/onboard" className="text-teal font-semibold">
            Start a formation →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-navy">Formation Timeline</div>
              <StatusBadge status={active.status} />
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="text-gray-400">Organization:</span> {active.orgname}
              </div>
              <div>
                <span className="text-gray-400">Entity type:</span> {entityFamily(active.entity_type).toUpperCase()}
              </div>
              <div>
                <span className="text-gray-400">State:</span> {active.state}
              </div>
              <div>
                <span className="text-gray-400">Plan:</span> {active.plan}
              </div>
              <div>
                <span className="text-gray-400">Registration ID:</span> {active.id}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-navy">
                My Documents{" "}
                <span className="text-xs font-normal text-gray-400 ml-2">
                  {getDocsForEntity(active.entity_type).length} documents ready
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Your formation document package is generated automatically from your onboarding
              answers.
            </p>
            <Link href="/dashboard/documents" className="text-teal font-semibold text-sm">
              View documents →
            </Link>
          </div>
        </div>
      )}

      {registrations.length > 1 && (
        <div className="mt-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            All Registrations
          </div>
          <div className="flex flex-col gap-2">
            {registrations.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-3.5 flex items-center justify-between text-sm"
              >
                <div>
                  <span className="font-medium text-navy">{r.orgname}</span>{" "}
                  <span className="text-gray-400">· {r.id}</span>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
