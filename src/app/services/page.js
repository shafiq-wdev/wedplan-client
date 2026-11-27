import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Sparkles } from "lucide-react";

import ServiceExplorer from "@/components/services/ServiceExplorer";
import { db } from "@/lib/db";
import {
  SERVICE_CATEGORY_META,
  getCategoryBySlug,
  normalizeCategory,
  serializeService,
} from "@/lib/services";

export const instant = false;

export default async function ServicesPage({ searchParams }) {
  await connection();

  const params = (await searchParams) ?? {};
  const requestedCategory =
    typeof params.category === "string" ? params.category : "";
  const activeCategory = getCategoryBySlug(requestedCategory);
  const initialQuery =
    typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const requestedLocation =
    typeof params.location === "string" ? params.location : "";

  let allServices = [];

  try {
    const services = await db
      .collection("services")
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    allServices = services.map(serializeService);
  } catch (error) {
    console.error("Unable to load published services:", error);
  }

  const categoryCounts = allServices.reduce((counts, service) => {
    const category = normalizeCategory(service.category);
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});

  const locationCounts = allServices.reduce((counts, service) => {
    const location = service.location?.trim();

    if (location) {
      counts[location] = (counts[location] || 0) + 1;
    }

    return counts;
  }, {});

  const categories = SERVICE_CATEGORY_META.map((category) => ({
    ...category,
    count: categoryCounts[category.label] || 0,
  }));

  const locations = Object.entries(locationCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({ name, count }));

  const initialLocation = locations.some(
    (item) => item.name === requestedLocation
  )
    ? requestedLocation
    : "";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8fa] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="relative animate-fade-up overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-8 text-white shadow-xl shadow-rose-200/60 sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 animate-float-slow rounded-full border-[40px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Trusted wedding professionals
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for your special day
            </h1>

            <p className="mt-3 leading-relaxed text-rose-50">
              Discover photographers, venues, florists, caterers, stylists, and
              fashion houses from verified WedPlan vendors — then compare every
              detail in one place.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Join WedPlan
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-rose-50 backdrop-blur-sm">
                {allServices.length} published{" "}
                {allServices.length === 1 ? "service" : "services"}
              </span>
            </div>
          </div>
        </section>

        <ServiceExplorer
          services={allServices}
          categories={categories}
          locations={locations}
          initialQuery={initialQuery}
          initialCategory={activeCategory?.slug ?? ""}
          initialLocation={initialLocation}
        />
      </div>
    </main>
  );
}
