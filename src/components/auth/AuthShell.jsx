import Link from "next/link";
import { CheckCircle2, Heart, Sparkles } from "lucide-react";

export default function AuthShell({
  badge = "Your dream wedding starts here",
  headline,
  description,
  features = [],
  children,
}) {
  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#fff8fa] px-4 py-8 sm:py-12 lg:py-16">
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-rose-100/70 lg:grid-cols-[1.05fr_1fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-10 text-white lg:flex xl:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 animate-float-slow rounded-full border-[40px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 animate-float-slower rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute right-10 top-1/3 h-24 w-24 rounded-full bg-white/10 blur-xl" />

          <Link href="/" className="relative z-10 flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <Heart size={28} fill="white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">WedPlan</span>
          </Link>

          <div className="relative z-10 max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles size={16} />
              {badge}
            </div>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              {headline}
            </h1>

            <p className="text-lg leading-relaxed text-rose-50">
              {description}
            </p>

            {features.length > 0 && (
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-rose-50"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="relative z-10 text-sm text-rose-100">
            © 2026 WedPlan. Make every moment special.
          </p>
        </section>

        <section className="flex items-center p-5 sm:p-8 lg:p-10 xl:p-12">
          <div className="mx-auto w-full max-w-md">
            <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
              <Heart className="text-rose-500" fill="#f43f5e" />
              <span className="text-2xl font-bold">
                Wed<span className="text-rose-500">Plan</span>
              </span>
            </Link>

            <div className="animate-fade-up">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
