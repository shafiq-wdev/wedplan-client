import { cn } from "cn";

export default function StatCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className="animate-fade-up relative overflow-hidden rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-rose-300 via-pink-200 to-transparent"
      />

      <div className="relative flex items-start justify-between gap-4">
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

      {detail ? (
        <p className="relative mt-3 text-xs leading-relaxed text-slate-500">
          {detail}
        </p>
      ) : null}
    </article>
  );
}
