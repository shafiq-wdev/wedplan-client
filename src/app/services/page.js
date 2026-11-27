import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Sparkles } from "lucide-react";

import ServiceExplorer from "@/components/services/ServiceExplorer";
import { db } from "@/lib/db";
import {
  getCategoryBySlug,
  getCategoryQueryValues,
  normalizeCategory,
  serializeService,
  SERVICE_CATEGORY_META,
} from "@/lib/services";

export const instant = false;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readPrice(value) {
  if (typeof value !== "string" || !/^\d+(?:\.\d+)?$/.test(value.trim())) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

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
  const minPrice = readPrice(params.minPrice);
  const maxPrice = readPrice(params.maxPrice);
  const sort =
    params.sort === "price_asc" || params.sort === "price_desc"
      ? params.sort
      : "newest";

  const filter = { status: "published" };

  if (activeCategory) {
    filter.category = { $in: getCategoryQueryValues(activeCategory.label) };
  }

  if (requestedLocation) {
    filter.location = requestedLocation;
  }

  const priceFilter = {};
  if (minPrice !== null) priceFilter.$gte = minPrice;
  if (maxPrice !== null) priceFilter.$lte = maxPrice;
  if (Object.keys(priceFilter).length > 0) filter.price = priceFilter;

  if (initialQuery) {
    const regex = new RegExp(escapeRegex(initialQuery), "i");
    filter.$or = [
      { title: regex },
      { description: regex },
      { location: regex },
      { vendorName: regex },
      { vendorTagline: regex },
      { category: regex },
    ];
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 },
  };

  let allServices = [];
  let loadError = "";

  try {
    const matching = await db
      .collection("services")
      .find(filter)
      .sort(sortOptions[sort])
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
