import { cn } from "cn";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  succeeded: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  expired: "bg-slate-100 text-slate-600 ring-slate-200",
  refunded: "bg-slate-100 text-slate-600 ring-slate-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  unavailable: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function StatusBadge({ status, children }) {
  const value = String(status ?? "").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
        statusStyles[value] ?? "bg-slate-100 text-slate-600 ring-slate-200"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children ?? value}
    </span>
  );
}
