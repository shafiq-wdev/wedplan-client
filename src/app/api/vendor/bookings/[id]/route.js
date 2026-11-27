import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { requireApiAccess } from "@/lib/auth-guards";
import { getVendorServiceFilter, serializeBooking } from "@/lib/dashboard-data";
import { db } from "@/lib/db";

const ALLOWED_STATUSES = ["accepted", "rejected"];

export async function PATCH(request, { params }) {
  const guard = await requireApiAccess(["vendor"]);
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

  const status = String(body?.status ?? "");

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
  }

  const objectId = new ObjectId(id);
  const booking = await db.collection("bookings").findOne({ _id: objectId });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const isVendor = booking.vendorId && String(booking.vendorId) === guard.session.user.id;

  const ownsService = booking.serviceId
    ? Boolean(
        await db.collection("services").findOne({
          _id: booking.serviceId,
          ...getVendorServiceFilter(guard.session.user),
        })
      )
    : false;

  if (!isVendor && !ownsService) {
    return NextResponse.json(
      { error: "You cannot manage this booking request." },
      { status: 403 }
    );
  }

  const result = await db.collection("bookings").updateOne(
    { _id: objectId, status: "pending" },
    { $set: { status, updatedAt: new Date() } }
  );

  if (!result.matchedCount) {
    return NextResponse.json(
      { error: "Only pending requests can be processed." },
      { status: 409 }
    );
  }

  const updated = await db.collection("bookings").findOne({ _id: objectId });

  return NextResponse.json({ booking: serializeBooking(updated) });
}
