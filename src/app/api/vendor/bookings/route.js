import { NextResponse } from "next/server";

import { requireApiAccess } from "@/lib/auth-guards";
import { getVendorBookings } from "@/lib/dashboard-queries";

export async function GET() {
  const guard = await requireApiAccess(["vendor"]);
  if (guard.error) return guard.error;

  const bookings = await getVendorBookings(guard.session.user);

  return NextResponse.json({ bookings });
}
