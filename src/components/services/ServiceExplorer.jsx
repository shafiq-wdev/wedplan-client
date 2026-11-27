"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  LoaderCircle,
  MapPin,
  Search,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";

import CategoryIcon from "@/components/services/CategoryIcon";
import ServiceCard from "@/components/services/ServiceCard";

export default function ServiceExplorer({
  services,
  categories,
  locations,
  initialQuery = "",
  initialCategory = "",
  initialLocation = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams();
      const trimmedQuery = query.trim();

      if (trimmedQuery) params.set("q", trimmedQuery);
      if (category) params.set("category", category);
      if (location) params.set("location", location);

      const queryString = params.toString();

      startTransition(() => {
        router.replace(
          queryString ? `${pathname}?${queryString}` : pathname,
          { scroll: false }
        );
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query, category, location, pathname, router, startTransition]);

  const normalizedQuery = query.trim().toLowerCase();
  const hasFilters = Boolean(normalizedQuery || category || location);

  const visibleServices = useMemo(() => {
    return services.filter((service) => {
      const matchesName =
        !normalizedQuery ||
        service.title.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        !category || service.categorySlug === category;
      const matchesLocation = !location || service.location === location;

      return matchesName && matchesCategory && matchesLocation;
    });
  }, [services, normalizedQuery, category, location]);

  const activeCategory = categories.find((item) => item.slug === category);
  const heading = activeCategory?.label || "All wedding services";
  const description = activeCategory?.blurb ||
    "Browse every published WedPlan service in one place.";

  function clearFilters() {
    setQuery("");
    setCategory("");
    setLocation("");
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/40 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search services by name</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services by name..."
              className="w-full rounded-2xl border border-rose-100 bg-rose-50/40 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
            />
          </label>

          <label className="relative min-w-[210px]">
            <span className="sr-only">Filter services by location</span>
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-rose-100 bg-rose-50/40 py-3 pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
            >
              <option value="">All locations</option>
              {locations.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} ({item.count})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
          </label>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              category
                ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "bg-rose-500 text-white shadow-sm shadow-rose-200"
            }`}
          >
            All services
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                category ? "bg-white text-rose-500" : "bg-white/20 text-white"
              }`}
            >
              {services.length}
            </span>
          </button>

          {categories.map((item) => {
            const active = category === item.slug;

            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => setCategory(item.slug)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-rose-500 text-white shadow-sm shadow-rose-200"
                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                }`}
              >
                <CategoryIcon category={item.label} className="h-4 w-4" />
                {item.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? "bg-white/20 text-white" : "bg-white text-rose-500"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <SlidersHorizontal className="h-5 w-5 text-rose-500" />
            {heading}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
          {isPending && (
            <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-slate-500">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-rose-500" />
              Updating
            </span>
          )}
          <span>
            {visibleServices.length}{" "}
            {visibleServices.length === 1 ? "listing" : "listings"}
          </span>
        </div>
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
            {services.length === 0
              ? "No published services yet"
              : "No services match your filters"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            {services.length === 0
              ? "Vendor listings appear here as soon as an admin publishes them."
              : "Try another service name, category, or location to find your perfect match."}
          </p>

          {services.length > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}
