import Link from "next/link";
import {
  ArrowRight,
  Camera,
  ChefHat,
  Flower2,
  Music4,
  Sparkles,
  Store,
} from "lucide-react";

const services = [
  {
    title: "Photographers",
    description: "Capture every candid moment and timeless portrait.",
    icon: Camera,
  },
  {
    title: "Venues",
    description: "Find the perfect setting for your ceremony and reception.",
    icon: Store,
  },
  {
    title: "Planners",
    description: "Work with experts who keep every detail on track.",
    icon: Sparkles,
  },
  {
    title: "Catering",
    description: "Delight your guests with menus made for the occasion.",
    icon: ChefHat,
  },
  {
    title: "Florals",
    description: "Bring your palette to life with beautiful arrangements.",
    icon: Flower2,
  },
  {
    title: "Music & entertainment",
    description: "Set the mood from the first dance to the last song.",
    icon: Music4,
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8fa] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="relative animate-fade-up overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-8 text-white shadow-xl shadow-rose-200/60 sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 animate-float-slow rounded-full border-[40px] border-white/10" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Trusted wedding professionals
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for your special day
            </h1>

            <p className="mt-3 leading-relaxed text-rose-50">
              Discover photographers, venues, planners, and more. Vendor
              listings and booking tools are coming soon.
            </p>

            <Link
              href="/sign-up"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              Join WedPlan
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="animate-fade-up rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-4 font-semibold text-gray-900">
                  {service.title}
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {service.description}
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
