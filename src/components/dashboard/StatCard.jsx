import { cn } from "cn";

export default function StatCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className="animate-fade-up rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        {Icon ? (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500",
              tone
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      {detail ? <p className="mt-3 text-xs text-slate-500">{detail}</p> : null}
    </article>
  );
}
