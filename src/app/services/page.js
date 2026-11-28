import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Sparkles } from "lucide-react";

import ServiceExplorer from "@/components/services/ServiceExplorer";
import { db } from "@/lib/db";
import {
  buildServiceFilter,
  getServiceSort,
  readPrice,
  readQueryValue,
} from "@/lib/service-query";
import {
  getCategoryBySlug,
  normalizeCategory,
  serializeService,
  SERVICE_CATEGORY_META,
} from "@/lib/services";

export const instant = false;

export default async function ServicesPage({ searchParams }) {
  await connection();

  const params = (await searchParams) ?? {};
  const activeCategory = getCategoryBySlug(readQueryValue(params.category));
  const initialQuery = readQueryValue(params.q).slice(0, 100);
  const requestedLocation = readQueryValue(params.location);
  const minPrice = readPrice(params.minPrice);
  const maxPrice = readPrice(params.maxPrice);
  const sort = ["price_asc", "price_desc"].includes(readQueryValue(params.sort))
    ? readQueryValue(params.sort)
    : "newest";

  const filter = buildServiceFilter(params);
  const sortOptions = getServiceSort(sort);

  let allServices = [];
  let loadError = "";

  try {
    const matching = await db
      .collection("services")
      .find(filter)
      .sort(sortOptions)
      .limit(200)
      .toArray();

    allServices = matching.map(serializeService);
  } catch (error) {
    console.error("Unable to load published services:", error);
    loadError =
      "We could not load services right now. Please check your connection and try again.";
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
          initialMinPrice={minPrice ?? ""}
          initialMaxPrice={maxPrice ?? ""}
          initialSort={sort}
          loadError={loadError}
        />
      </div>
    </main>
  );
}
