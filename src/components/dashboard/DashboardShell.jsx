import { Sparkles } from "lucide-react";

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
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8fa] lg:flex">
      <DashboardSidebar role={role} badge={badge} />

      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="animate-fade-up rounded-[2rem] border border-rose-100 bg-white p-6 shadow-sm shadow-rose-100/50 sm:p-8">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
              <Sparkles className="h-3.5 w-3.5" />
              {getRoleLabel(role)} dashboard
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {title}
            </h1>

            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            ) : null}

            {actions ? (
              <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
            ) : null}
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
