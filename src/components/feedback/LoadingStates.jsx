import { Loader2 } from "lucide-react";

import { cn } from "cn";

export function Spinner({ className, label = "Loading" }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function Skeleton({ className }) {
  return (
    <div
      className={cn("animate-pulse-soft rounded-lg bg-rose-50", className)}
      aria-hidden="true"
    />
  );
}

export function ServiceGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm"
        >
          <Skeleton className="aspect-[4/3] rounded-none bg-rose-100" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-3/4 bg-slate-100" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton({ role = "workspace" }) {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#fff8fa]" role="status" aria-live="polite">
      <span className="sr-only">Loading {role} dashboard</span>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 space-y-3 lg:block">
          <Skeleton className="h-12 rounded-2xl bg-rose-100" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 rounded-xl" />
          ))}
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <div className="space-y-3 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-72 max-w-full bg-rose-100" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="space-y-3 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16 bg-rose-100" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ title = "Loading WedPlan" }) {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#fff8fa] px-4 py-10 sm:px-6 sm:py-14" role="status" aria-live="polite">
      <span className="sr-only">{title}</span>

      <div className="mx-auto max-w-6xl space-y-8">
        <Skeleton className="h-48 rounded-[2rem] bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 sm:h-64" />

        <div className="space-y-3">
          <Skeleton className="h-8 w-64 max-w-full bg-rose-100" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        <ServiceGridSkeleton count={3} />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#fff8fa] px-4 py-10 sm:px-6" role="status" aria-live="polite">
      <span className="sr-only">Loading service details</span>

      <div className="mx-auto max-w-6xl space-y-8">
        <Skeleton className="h-[280px] rounded-[2rem] bg-rose-100 sm:h-[420px]" />
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-3/4 bg-rose-100" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-3 rounded-3xl border border-rose-100 bg-white p-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
