import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { requireApiAccess } from "@/lib/auth-guards";
import { serializeBooking } from "@/lib/dashboard-data";
import { db } from "@/lib/db";

export async function PATCH(request, { params }) {
  const guard = await requireApiAccess(["customer"]);
  if (guard.error) return guard.error;

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid booking id." },
      { status: 400 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (String(body?.status ?? "") !== "cancelled") {
    return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
  }

  const objectId = new ObjectId(id);
  const booking = await db.collection("bookings").findOne({ _id: objectId });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (String(booking.customerId ?? "") !== guard.session.user.id) {
    return NextResponse.json(
      { error: "You cannot cancel this booking request." },
      { status: 403 }
    );
  }

  const result = await db.collection("bookings").updateOne(
    { _id: objectId, status: "pending" },
    { $set: { status: "cancelled", updatedAt: new Date() } }
  );

  if (!result.matchedCount) {
    return NextResponse.json(
      { error: "Only pending requests can be cancelled." },
      { status: 409 }
    );
  }

  const updated = await db.collection("bookings").findOne({ _id: objectId });

  return NextResponse.json({ booking: serializeBooking(updated) });
}
