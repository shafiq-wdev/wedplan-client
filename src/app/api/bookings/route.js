import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { requireApiAccess } from "@/lib/auth-guards";
import { db } from "@/lib/db";

const ACTIVE_STATUSES = ["pending", "accepted"];

function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const guard = await requireApiAccess();
  if (guard.error) return guard.error;

  const { session } = guard;
  const role = session.user.role || "customer";

  if (role !== "customer") {
    return jsonError(
      role === "vendor"
        ? "Vendors cannot submit customer booking requests."
        : "Admins cannot submit customer booking requests.",
      403
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const serviceId = String(body?.serviceId ?? "").trim();

  if (!ObjectId.isValid(serviceId)) {
    return jsonError("Invalid service ID.", 400);
  }

  const service = await db
    .collection("services")
    .findOne({ _id: new ObjectId(serviceId), status: "published" });

  if (!service) {
    return jsonError("This service is not available for booking.", 404);
  }

  if (service.isAvailable === false) {
    return jsonError("This service is not accepting bookings right now.", 409);
  }

  const customerId = session.user.id;
  const serviceVendorId = service.vendorId ? String(service.vendorId) : "";

  if (serviceVendorId && serviceVendorId === customerId) {
    return jsonError("You cannot book your own service.", 403);
  }

  const vendorName = String(service.vendorName ?? "").trim().toLowerCase();
  const customerName = String(session.user.name ?? "").trim().toLowerCase();
  const businessName = String(session.user.businessName ?? "")
    .trim()
    .toLowerCase();

  if (
    vendorName &&
    (vendorName === customerName ||
      (businessName && vendorName === businessName))
  ) {
    return jsonError("You cannot book your own service.", 403);
  }

  const eventDate = String(body?.eventDate ?? "").trim();
  const eventLocation = String(body?.eventLocation ?? "").trim();
  const message = String(body?.message ?? "").trim().slice(0, 1000);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return jsonError("Please choose a valid event date.", 400);
  }

  const selectedDate = new Date(`${eventDate}T00:00:00.000Z`);

  if (Number.isNaN(selectedDate.getTime())) {
    return jsonError("Please choose a valid event date.", 400);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return jsonError("Event date cannot be in the past.", 400);
  }

  if (eventLocation.length < 3 || eventLocation.length > 200) {
    return jsonError(
      "Event location must be between 3 and 200 characters.",
      400
    );
  }

  const duplicate = await db.collection("bookings").findOne({
    serviceId: new ObjectId(serviceId),
    customerId,
    eventDate,
    status: { $in: ACTIVE_STATUSES },
  });

  if (duplicate) {
    return jsonError(
      "You already have an active request for this service on that date.",
      409
    );
  }

  const now = new Date();
  const booking = {
    serviceId: new ObjectId(serviceId),
    serviceName: String(service.title ?? ""),
    serviceImage: String(service.image ?? ""),
    vendorId: serviceVendorId,
    vendorName: String(service.vendorName ?? ""),
    customerId,
    customerName: String(session.user.name ?? ""),
    customerEmail: String(session.user.email ?? ""),
    eventDate,
    eventLocation,
    message,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("bookings").insertOne(booking);

  return NextResponse.json(
    {
      booking: {
        ...booking,
        id: result.insertedId.toString(),
        serviceId: serviceId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    },
    { status: 201 }
  );
}
