import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Sparkles, Store } from "lucide-react";

import CategoryIcon from "@/components/services/CategoryIcon";
import ServiceCard from "@/components/services/ServiceCard";
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
  const categorySlug =
    typeof params.category === "string" ? params.category : "";
  const activeCategory = getCategoryBySlug(categorySlug);

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

  const visibleServices = activeCategory
    ? allServices.filter(
        (service) => service.category === activeCategory.label
      )
    : allServices;

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

        <section className="rounded-3xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/40 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/services"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "bg-rose-500 text-white shadow-sm shadow-rose-200"
              }`}
            >
              All services
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeCategory
                    ? "bg-white text-rose-500"
                    : "bg-white/20 text-white"
                }`}
              >
                {allServices.length}
              </span>
            </Link>

            {SERVICE_CATEGORY_META.map((category) => {
              const active = activeCategory?.slug === category.slug;
              const count = categoryCounts[category.label] || 0;

              return (
                <Link
                  key={category.slug}
                  href={`/services?category=${category.slug}`}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-rose-500 text-white shadow-sm shadow-rose-200"
                      : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  }`}
                >
                  <CategoryIcon category={category.label} className="h-4 w-4" />
                  {category.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white text-rose-500"
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {activeCategory ? activeCategory.label : "Featured services"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeCategory
                  ? activeCategory.blurb
                  : "Published by verified WedPlan vendors."}
              </p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
              {visibleServices.length}{" "}
              {visibleServices.length === 1 ? "listing" : "listings"}
            </p>
          </div>

          {visibleServices.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-rose-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                <Store className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {activeCategory
                  ? `No ${activeCategory.label.toLowerCase()} services yet`
                  : "No published services yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                {activeCategory
                  ? "New vendors are joining soon. Explore another category in the meantime."
                  : "Vendor listings appear here as soon as an admin publishes them."}
              </p>

              <Link
                href={activeCategory ? "/services" : "/sign-up"}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                {activeCategory ? "View all services" : "Join WedPlan"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
