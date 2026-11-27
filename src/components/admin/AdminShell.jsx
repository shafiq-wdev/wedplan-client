import { ShieldCheck } from "lucide-react";
import AdminNav from "./AdminNav";

export default function AdminShell({
  title,
  description,
  actions,
  children,
}) {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#f7f8fc] px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="relative animate-fade-up overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl shadow-slate-300/40 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 animate-float-slow rounded-full border-[32px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin console
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                {description}
              </p>
            </div>

            {actions}
          </div>

          <div className="relative z-10 mt-6">
            <AdminNav />
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
