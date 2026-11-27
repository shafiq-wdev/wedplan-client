import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, XCircle } from "lucide-react";

import RefreshButton from "@/components/feedback/RefreshButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

const variants = {
  success: {
    icon: CheckCircle2,
    iconClass: "bg-emerald-100 text-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  pending: {
    icon: Clock3,
    iconClass: "bg-amber-100 text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  cancel: {
    icon: XCircle,
    iconClass: "bg-rose-100 text-rose-600",
    badgeClass: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  error: {
    icon: AlertTriangle,
    iconClass: "bg-amber-100 text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
  },
};

export default function PaymentResultCard({
  variant = "pending",
  title,
  description,
  statusLabel,
  sessionId,
  showRefresh = false,
}) {
  const style = variants[variant] || variants.pending;
  const Icon = style.icon;

  return (
    <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-rose-100 bg-white p-8 text-center shadow-sm sm:p-10">
      <div
        className={cn(
          "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
          style.iconClass
        )}
      >
        <Icon className="h-8 w-8" />
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset",
            style.badgeClass
          )}
        >
          {statusLabel}
        </span>

        {sessionId ? (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 font-mono text-[11px] text-slate-500">
            {sessionId}
          </span>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/vendor/dashboard/subscription"
          className={cn(
            buttonVariants(),
            "h-11 rounded-xl bg-rose-500 px-5 text-white hover:bg-rose-600"
          )}
        >
          Back to subscription
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>

        {showRefresh ? <RefreshButton /> : null}
      </div>
    </div>
  );
}
