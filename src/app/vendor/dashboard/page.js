import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Clock3,
  Crown,
  Store,
} from "lucide-react";

import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import VendorBookingsManager from "@/components/dashboard/VendorBookingsManager";
import { buttonVariants } from "@/components/ui/button";
import { requirePageAccess } from "@/lib/auth-guards";
import { countBookingsByStatus } from "@/lib/dashboard-data";
import {
  getVendorBookings,
  getVendorServiceDocuments,
} from "@/lib/dashboard-queries";
import { getVendorPlan, getVendorPlanDetails } from "@/lib/plans";
import { serializeService } from "@/lib/services";
import { cn } from "cn";

export const instant = false;

export default async function VendorDashboardPage() {
  await connection();

  const session = await requirePageAccess(["vendor"]);
  const [serviceDocuments, bookings] = await Promise.all([
    getVendorServiceDocuments(session.user),
    getVendorBookings(session.user),
  ]);

  const services = serviceDocuments.map(serializeService);
  const bookingCounts = countBookingsByStatus(bookings);
  const plan = getVendorPlan(session.user);
  const planDetails = getVendorPlanDetails(session.user);
  const activeCount = services.filter(
    (service) => service.status === "published"
  ).length;
  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <DashboardShell
      role="vendor"
      title={`Welcome, ${firstName}`}
      description="Manage your listings, respond to couple enquiries, and keep your subscription in one place."
      badge={
        plan === "premium"
          ? "Premium vendor"
          : `Free plan · ${activeCount}/3 active services`
      }
      actions={
        <>
          <Link
            href="/vendor/dashboard/services"
            className={cn(
              buttonVariants(),
              "rounded-xl bg-rose-500 hover:bg-rose-600"
            )}
          >
            Manage services
          </Link>
          <Link
            href="/vendor/dashboard/bookings"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-xl"
            )}
          >
            Booking requests
          </Link>
          <Link
            href="/vendor/dashboard/subscription"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-xl"
            )}
          >
            Subscription
          </Link>
        </>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total services"
          value={services.length}
          detail="All packages you have submitted"
          icon={Store}
        />
        <StatCard
          label="Active services"
          value={activeCount}
          detail={planDetails.maxActiveServices === null ? "Unlimited" : "Free plan limit: 3"}
          icon={BadgeCheck}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Pending requests"
          value={bookingCounts.pending}
          detail="Waiting for your response"
          icon={Clock3}
          tone="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Accepted bookings"
          value={bookingCounts.accepted}
          detail="Requests you confirmed"
          icon={CalendarCheck}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Current plan"
          value={planDetails.label}
          detail={
            plan === "premium"
              ? "Premium vendor badge active"
              : "Upgrade for unlimited listings"
          }
          icon={Crown}
          tone="bg-amber-50 text-amber-600"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent services</h2>
            <p className="mt-1 text-xs text-slate-500">
              Approval status updates after an admin reviews your listing.
            </p>
          </div>

          <Link
            href="/vendor/dashboard/services"
            className="inline-flex items-center gap-1 text-sm font-semibold text-rose-500 transition hover:text-rose-600"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              You have not submitted any services yet.
            </p>
            <Link
              href="/vendor/dashboard/services"
              className={cn(
                buttonVariants(),
                "mt-4 rounded-xl bg-rose-500 hover:bg-rose-600"
              )}
            >
              Add your first service
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {services.slice(0, 3).map((service) => (
              <article
                key={service.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {service.title}
                    </h3>
                    <StatusBadge status={service.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {service.category} · {service.location} · ${" "}
                    {Number(service.price).toLocaleString()}
                  </p>
                </div>

                <Link
                  href="/vendor/dashboard/services"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-rose-500 transition hover:text-rose-600"
                >
                  Manage
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Recent booking requests
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Accept or reject pending requests for your services.
          </p>
        </div>

        <VendorBookingsManager initialBookings={bookings.slice(0, 3)} />
      </section>
    </DashboardShell>
  );
}
