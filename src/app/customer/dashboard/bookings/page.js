import Link from "next/link";
import { connection } from "next/server";
import { Store } from "lucide-react";

import CustomerBookingsManager from "@/components/dashboard/CustomerBookingsManager";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { buttonVariants } from "@/components/ui/button";
import { requirePageAccess } from "@/lib/auth-guards";
import { getCustomerBookings } from "@/lib/dashboard-queries";
import { cn } from "cn";

export const instant = false;

export default async function CustomerBookingsPage() {
  await connection();

  const session = await requirePageAccess(["customer"]);
  const bookings = await getCustomerBookings(session.user.id);

  return (
    <DashboardShell
      role="customer"
      title="My bookings"
      description="Review the services, vendors, dates, locations, and status of every booking request you have submitted."
      actions={
        <Link
          href="/services"
          className={cn(
            buttonVariants(),
            "rounded-xl bg-rose-500 hover:bg-rose-600"
          )}
        >
          <Store className="mr-2 h-4 w-4" />
          Browse more services
        </Link>
      }
    >
      <CustomerBookingsManager initialBookings={bookings} />
    </DashboardShell>
  );
}
