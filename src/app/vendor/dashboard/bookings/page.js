import { connection } from "next/server";

import DashboardShell from "@/components/dashboard/DashboardShell";
import VendorBookingsManager from "@/components/dashboard/VendorBookingsManager";
import { requirePageAccess } from "@/lib/auth-guards";
import { getVendorBookings } from "@/lib/dashboard-queries";

export const instant = false;

export default async function VendorBookingsPage() {
  await connection();

  const session = await requirePageAccess(["vendor"]);
  const bookings = await getVendorBookings(session.user);

  return (
    <DashboardShell
      role="vendor"
      title="Booking requests"
      description="Review customer details, event information, and messages. Only pending requests can be accepted or rejected."
    >
      <VendorBookingsManager initialBookings={bookings} />
    </DashboardShell>
  );
}
