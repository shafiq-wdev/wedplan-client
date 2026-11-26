import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

export default function DashboardShell({
  roleLabel,
  title,
  description,
  cards = [],
}) {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8fa] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="relative animate-fade-up overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-8 text-white shadow-xl shadow-rose-200/60 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 animate-float-slow rounded-full border-[32px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-sm font-medium text-rose-100">
              <Sparkles className="h-4 w-4" />
              {roleLabel} dashboard
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>

            <p className="mt-3 max-w-2xl leading-relaxed text-rose-50">
              {description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Browse services
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View profile
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = card.icon || Heart;

            return (
              <article
                key={card.title}
                className="animate-fade-up rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-4 font-semibold text-gray-900">
                  {card.title}
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {card.description}
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
