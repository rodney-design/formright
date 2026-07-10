const STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-teal-pale text-teal border-teal/20",
  payment_failed: "bg-red-50 text-red-600 border-red-200",
  in_review: "bg-blue-50 text-blue-600 border-blue-200",
  filed: "bg-blue-50 text-blue-600 border-blue-200",
  complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const LABELS: Record<string, string> = {
  pending: "Awaiting Payment",
  paid: "Active",
  payment_failed: "Payment Failed",
  in_review: "In Review",
  filed: "Filed",
  complete: "Complete",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  const label = LABELS[status] ?? status;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${style}`}>{label}</span>
  );
}
