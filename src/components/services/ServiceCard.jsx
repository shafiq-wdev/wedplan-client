import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function vendorInitials(name) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "WP"
  );
}

export default function ServiceCard({ service }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm shadow-rose-100/50 transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-200/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-rose-200 via-pink-200 to-amber-100">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-rose-400">
            <Sparkles className="h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-rose-600 shadow-sm backdrop-blur">
          {service.category}
        </span>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 text-[10px] font-bold text-white backdrop-blur">
              {vendorInitials(service.vendorName || "WedPlan Vendor")}
            </span>

            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                Vendor
              </span>
              <span className="block truncate text-sm font-semibold text-white">
                {service.vendorName || "WedPlan vendor"}
              </span>
            </span>
          </div>

          <span className="shrink-0 rounded-full bg-rose-500/95 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {formatPrice(service.price)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-rose-400" />
          <span className="truncate">
            {service.location || "Location available on request"}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-slate-900">
          {service.title}
        </h3>

        {service.vendorTagline && (
          <p className="mt-1 line-clamp-1 text-xs font-medium text-rose-500">
            {service.vendorTagline}
          </p>
        )}

        {service.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {service.description}
          </p>
        )}

        <Link
          href={`/services/${service.id}`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-4 min-h-11 w-full rounded-full border-rose-200 bg-rose-50/60 font-semibold text-rose-600 hover:border-rose-300 hover:bg-rose-500 hover:text-white"
          )}
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
