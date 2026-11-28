import { Heart, Sparkles } from "lucide-react";

import DashboardSidebar from "./DashboardSidebar";
import { getRoleLabel } from "@/lib/roles";

export default function DashboardShell({
  role = "customer",
  title,
  description,
  actions,
  badge,
  children,
}) {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-[#fff8fa] via-white to-[#fff1f5] lg:flex">
      <DashboardSidebar role={role} badge={badge} />

      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="animate-fade-up relative overflow-hidden rounded-[2rem] border border-rose-100 bg-white/90 p-6 shadow-sm shadow-rose-100/60 backdrop-blur sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-gradient-to-br from-rose-100/90 to-pink-50 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-5 right-24 hidden text-rose-200 sm:block"
            >
              <Heart className="h-12 w-12" fill="currentColor" />
            </div>

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
                  <Sparkles className="h-3.5 w-3.5" />
                  {getRoleLabel(role)} dashboard
                </span>

                {badge ? (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                    {badge}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h1>

              {description ? (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">
                  {description}
                </p>
              ) : null}

              {actions ? (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-rose-100/70 pt-5">
                  {actions}
                </div>
              ) : null}
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
