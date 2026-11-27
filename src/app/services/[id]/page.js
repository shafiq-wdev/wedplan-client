import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ObjectId } from "mongodb";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  LockKeyhole,
  MapPin,
  Tag,
} from "lucide-react";

import BookingForm from "@/components/services/BookingForm";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceGallery from "@/components/services/ServiceGallery";
import { requirePageAccess } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { getCategoryQueryValues, serializeService } from "@/lib/services";

export const instant = false;

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

export default async function ServiceDetailsPage({ params }) {
  await connection();

  const session = await requirePageAccess();

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const document = await db
    .collection("services")
    .findOne({ _id: new ObjectId(id), status: "published" });

  if (!document) {
    notFound();
  }

  const service = serializeService(document);
  const role = session.user.role || "customer";
  const userName = String(session.user.name ?? "").trim().toLowerCase();
  const vendorName = String(service.vendorName ?? "").trim().toLowerCase();
  const isOwnService =
    role === "vendor" &&
    ((service.vendorId && service.vendorId === session.user.id) ||
      (vendorName && vendorName === userName));

  let relatedServices = [];

  try {
    const related = await db
      .collection("services")
      .find({
        _id: { $ne: document._id },
        status: "published",
        category: { $in: getCategoryQueryValues(service.category) },
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    relatedServices = related.map(serializeService);
  } catch (error) {
    console.error("Unable to load related services:", error);
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#fff8fa] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/services"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to all services
        </Link>

        <section className="animate-fade-up overflow-hidden rounded-[2rem] border border-rose-100 bg-white shadow-xl shadow-rose-100/50">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <ServiceGallery
              images={service.images}
              title={service.title}
              category={service.category}
            />

            <div className="flex flex-col p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
                <BadgeCheck className="h-4 w-4" />
                Approved & active listing
              </div>

              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                {service.title}
              </h1>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-sm font-bold text-white shadow-sm">
                  {vendorInitials(service.vendorName || "WedPlan Vendor")}
                </span>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-400">
                    Vendor information
                  </p>
                  <p className="truncate text-base font-semibold text-slate-900">
                    {service.vendorName || "WedPlan vendor"}
                  </p>
                  {service.vendorTagline && (
                    <p className="truncate text-xs text-slate-500">
                      {service.vendorTagline}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <Tag className="h-3.5 w-3.5" />
                    Starting price
                  </p>
                  <p className="mt-1.5 text-2xl font-bold text-slate-900">
                    {formatPrice(service.price)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-900">
                    {service.location || "Available on request"}
                  </p>
                </div>
              </div>

              {service.description && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-slate-900">
                    About this service
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-500">
                    {service.description}
                  </p>
                </div>
              )}

              <div className="mt-7">
                {role === "customer" ? (
                  <BookingForm
                    serviceId={service.id}
                    serviceTitle={service.title}
                    vendorName={service.vendorName}
                  />
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm">
                        <LockKeyhole className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Booking is for customer accounts
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                          {isOwnService
                            ? "This is your own service. Vendors cannot book their own listings."
                            : role === "admin"
                              ? "Admins cannot submit customer booking requests."
                              : "Sign in with a customer account to send a booking request."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href={`/services?category=${service.categorySlug}`}
                className="group mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700"
              >
                More in this category
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {relatedServices.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                More {service.category.toLowerCase()}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Other published services couples are exploring.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((related, index) => (
                <ServiceCard
                  key={related.id}
                  service={related}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
