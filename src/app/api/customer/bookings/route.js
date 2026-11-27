import { NextResponse } from "next/server";

import { requireApiAccess } from "@/lib/auth-guards";
import { getCustomerBookings } from "@/lib/dashboard-queries";

export async function GET() {
  const guard = await requireApiAccess(["customer"]);
  if (guard.error) return guard.error;

  const bookings = await getCustomerBookings(guard.session.user.id);

  return NextResponse.json({ bookings });
}
