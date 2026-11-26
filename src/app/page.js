import Link from "next/link";
import {
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

const features = [
  {
    title: "Plan together",
    description:
      "Keep your checklist, budget, and bookings organized in one calm space.",
    icon: CalendarHeart,
  },
  {
    title: "Find trusted vendors",
    description:
      "Discover photographers, venues, planners, and more for your big day.",
    icon: Store,
  },
  {
    title: "Built for every role",
    description:
      "Customers plan with confidence while vendors manage their business.",
    icon: Users,
  },
];

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8fa]">
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:pt-20">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-pink-200/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Wedding planning made simple
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Plan your dream
              <br />
              wedding,{" "}
              <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                together.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
              WedPlan brings your checklist, vendors, and inspiration into one
              beautiful space — whether you are planning the day or helping
              couples create it.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 hover:bg-rose-600"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-50"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-5 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Free to join
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure authentication
              </span>
            </div>
          </div>

          <div className="relative animate-fade-up animation-delay-200">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-8 text-white shadow-2xl shadow-rose-200/70">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 animate-float-slow rounded-full border-[28px] border-white/10" />

              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Heart size={28} fill="white" />
                </div>

                <h2 className="mt-6 text-2xl font-bold">
                  Your special day, beautifully organized.
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-rose-50">
                  From the first idea to the final dance, keep every detail
                  close and every decision clear.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    "Personal customer and vendor dashboards",
                    "Profile images and account roles",
                    "Email and Google sign-in",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-rose-50"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="animate-fade-up rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-4 font-semibold text-gray-900">
                  {feature.title}
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
