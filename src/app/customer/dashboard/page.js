import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CircleX,
  ClipboardList,
  Store,
} from "lucide-react";

import CustomerBookingsManager from "@/components/dashboard/CustomerBookingsManager";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatCard from "@/components/dashboard/StatCard";
import { buttonVariants } from "@/components/ui/button";
import { requirePageAccess } from "@/lib/auth-guards";
import { countBookingsByStatus } from "@/lib/dashboard-data";
import { getCustomerBookings } from "@/lib/dashboard-queries";
import { cn } from "cn";

export const instant = false;

export default async function CustomerDashboardPage() {
  await connection();

  const session = await requirePageAccess(["customer"]);
  const bookings = await getCustomerBookings(session.user.id);
  const counts = countBookingsByStatus(bookings);
  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <DashboardShell
      role="customer"
      title={`Welcome, ${firstName}`}
      description="Track every booking request, follow its status, and keep your wedding plans organized in one place."
      actions={
        <>
          <Link
            href="/customer/dashboard/bookings"
            className={cn(
              buttonVariants(),
              "rounded-xl bg-rose-500 hover:bg-rose-600"
            )}
          >
            My bookings
          </Link>
          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-xl"
            )}
          >
            <Store className="mr-2 h-4 w-4" />
            Browse services
          </Link>
        </>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total requests"
          value={bookings.length}
          detail="All booking enquiries you have sent"
          icon={ClipboardList}
        />
        <StatCard
          label="Pending"
          value={counts.pending}
          detail="Awaiting a vendor response"
          icon={CalendarClock}
          tone="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Accepted"
          value={counts.accepted}
          detail="Vendors confirmed your request"
          icon={CalendarCheck}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          detail="Requests that were not accepted"
          icon={CircleX}
          tone="bg-rose-50 text-rose-600"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent booking requests
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your three latest enquiries. You can cancel requests that are
              still pending.
            </p>
          </div>

          <Link
            href="/customer/dashboard/bookings"
            className="inline-flex items-center gap-1 text-sm font-semibold text-rose-500 transition hover:text-rose-600"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <CustomerBookingsManager initialBookings={bookings.slice(0, 3)} />
      </section>
    </DashboardShell>
  );
}
