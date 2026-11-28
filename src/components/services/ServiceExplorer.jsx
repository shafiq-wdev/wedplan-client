"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Store,
  Wallet,
  X,
} from "lucide-react";

import CategoryIcon from "@/components/services/CategoryIcon";
import ServiceCard from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { SORT_OPTIONS } from "@/lib/service-query";

const CONTROL_CLASS =
  "h-11 rounded-xl border-rose-100 bg-rose-50/40 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:border-rose-300 focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-rose-100";

function buildParams({ query, category, location, minPrice, maxPrice, sort }) {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (trimmedQuery) params.set("q", trimmedQuery);
  if (category) params.set("category", category);
  if (location) params.set("location", location);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (sort && sort !== "newest") params.set("sort", sort);

  return params;
}

export default function ServiceExplorer({
  services,
  categories,
  locations,
  initialQuery = "",
  initialCategory = "",
  initialLocation = "",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialSort = "newest",
  loadError = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const lastPushed = useRef("");
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);
  const [minPrice, setMinPrice] = useState(String(initialMinPrice));
  const [maxPrice, setMaxPrice] = useState(String(initialMaxPrice));
  const [sort, setSort] = useState(initialSort);

  // Keep controls in sync when filters arrive from another page (for example a
  // category link on the home page) without clobbering values the user is typing.
  useEffect(() => {
    const incoming = buildParams({
      query: initialQuery,
      category: initialCategory,
      location: initialLocation,
      minPrice: String(initialMinPrice),
      maxPrice: String(initialMaxPrice),
      sort: initialSort,
    }).toString();

    if (incoming === lastPushed.current) {
      lastPushed.current = "";
      return;
    }

    setQuery(initialQuery);
    setCategory(initialCategory);
    setLocation(initialLocation);
    setMinPrice(String(initialMinPrice));
    setMaxPrice(String(initialMaxPrice));
    setSort(initialSort);
  }, [
    initialQuery,
    initialCategory,
    initialLocation,
    initialMinPrice,
    initialMaxPrice,
    initialSort,
  ]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const queryString = buildParams({
        query,
        category,
        location,
        minPrice,
        maxPrice,
        sort,
      }).toString();

      lastPushed.current = queryString;

      startTransition(() => {
        router.replace(
          queryString ? `${pathname}?${queryString}` : pathname,
          { scroll: false }
        );
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query, category, location, minPrice, maxPrice, sort, pathname, router]);

  const normalizedQuery = query.trim().toLowerCase();
  const floor = minPrice === "" ? null : Number(minPrice);
  const ceiling = maxPrice === "" ? null : Number(maxPrice);
  const hasFilters = Boolean(
    normalizedQuery || category || location || minPrice || maxPrice ||
      sort !== "newest"
  );

  const visibleServices = useMemo(() => {
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    const filtered = services.filter((service) => {
      const haystack = [
        service.title,
        service.serviceName,
        service.description,
        service.location,
        service.vendorName,
        service.vendorTagline,
        service.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = terms.every((term) => haystack.includes(term));
      const matchesCategory = !category || service.categorySlug === category;
      const matchesLocation = !location || service.location === location;
      const matchesMin = floor === null || Number(service.price) >= floor;
      const matchesMax = ceiling === null || Number(service.price) <= ceiling;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesLocation &&
        matchesMin &&
        matchesMax
      );
    });

    if (sort === "price_asc") {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price_desc") {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return filtered;
  }, [
    services,
    normalizedQuery,
    category,
    location,
    floor,
    ceiling,
    sort,
  ]);

  const activeCategory = categories.find((item) => item.slug === category);
  const heading = activeCategory?.label || "All wedding services";
  const description =
    activeCategory?.blurb ||
    "Browse every published WedPlan service in one place.";

  function clearFilters() {
    setQuery("");
    setCategory("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  }

  return (
    <section className="space-y-5">
      {loadError ? (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{loadError}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.refresh()}
            className="self-start rounded-lg font-semibold text-rose-600 hover:bg-rose-100 hover:text-rose-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : null}

      <div className="rounded-3xl border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100/40 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search wedding services</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by service, vendor, or location..."
              className={cn(CONTROL_CLASS, "w-full rounded-2xl pl-11 pr-4")}
            />
          </label>

          <label className="relative min-w-[210px]">
            <span className="sr-only">Filter services by location</span>
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={cn(CONTROL_CLASS, "w-full appearance-none rounded-2xl pl-11 pr-10 font-medium")}
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
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-rose-500">
              <Wallet className="h-4 w-4" />
              Price
            </span>
            <label className="sr-only" htmlFor="minPrice">
              Minimum price
            </label>
            <input
              id="minPrice"
              type="number"
              min="0"
              inputMode="numeric"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min"
              className={cn(CONTROL_CLASS, "w-24 px-3")}
            />
            <span className="text-slate-300">—</span>
            <label className="sr-only" htmlFor="maxPrice">
              Maximum price
            </label>
            <input
              id="maxPrice"
              type="number"
              min="0"
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max"
              className={cn(CONTROL_CLASS, "w-24 px-3")}
            />
          </div>

          <label className="relative min-w-[190px]">
            <span className="sr-only">Sort services</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={cn(CONTROL_CLASS, "w-full appearance-none px-3 pr-9 font-medium")}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
          </label>

          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="min-h-11 rounded-xl border-rose-200 px-4 font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            type="button"
            variant={category ? "secondary" : "default"}
            aria-pressed={!category}
            onClick={() => setCategory("")}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-4 font-semibold",
              !category && "shadow-sm shadow-rose-200"
            )}
          >
            All services
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                category ? "bg-white text-rose-500" : "bg-white/20 text-white"
              )}
            >
              {services.length}
            </span>
          </Button>

          {categories.map((item) => {
            const active = category === item.slug;

            return (
              <Button
                key={item.slug}
                type="button"
                variant={active ? "default" : "secondary"}
                aria-pressed={active}
                onClick={() => setCategory(item.slug)}
                className={cn(
                  "min-h-11 shrink-0 gap-2 rounded-full px-4 font-semibold",
                  active && "shadow-sm shadow-rose-200"
                )}
              >
                <CategoryIcon category={item.label} className="h-4 w-4" />
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-white text-rose-500"
                  )}
                >
                  {item.count}
                </span>
              </Button>
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

        <div
          aria-live="polite"
          className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-rose-500"
        >
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
            {services.length === 0 && !hasFilters
              ? "No published services yet"
              : "No services match your filters"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            {services.length === 0 && !hasFilters
              ? "Vendor listings appear here as soon as an admin publishes them."
              : "Try another service name, price range, category, or location to find your perfect match."}
          </p>

          {hasFilters && (
            <Button
              type="button"
              onClick={clearFilters}
              className="mt-5 min-h-11 rounded-full px-5 font-semibold"
            >
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
