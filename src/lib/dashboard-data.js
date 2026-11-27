import { normalizeImages } from "./services";

export const BOOKING_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getVendorServiceFilter(user) {
  const vendorId = String(user?.id ?? "");
  const names = [user?.name, user?.businessName]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  const conditions = [];

  if (vendorId) {
    conditions.push({ vendorId });
  }

  for (const name of names) {
    conditions.push({
      vendorName: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    });
  }

  return { $or: conditions.length > 0 ? conditions : [{ vendorId: "__none__" }] };
}

export function getServiceImageMap(services) {
  return new Map(
    services.map((service) => [
      String(service._id),
      normalizeImages(
        Array.isArray(service.images) && service.images.length > 0
          ? service.images
          : service.image
      )[0] || "",
    ])
  );
}

export function serializeBooking(booking, serviceImageMap = new Map()) {
  const serviceId = booking?.serviceId ? String(booking.serviceId) : "";
  const serviceImage = serviceImageMap.get(serviceId) || "";

  return {
    id: String(booking?._id ?? ""),
    serviceId,
    serviceName: booking?.serviceName || "",
    serviceImage: booking?.serviceImage || serviceImage,
    vendorId: booking?.vendorId ? String(booking.vendorId) : "",
    vendorName: booking?.vendorName || "",
    customerName: booking?.customerName || "",
    customerEmail: booking?.customerEmail || "",
    eventDate: booking?.eventDate || "",
    eventLocation: booking?.eventLocation || "",
    message: booking?.message || "",
    status: booking?.status || "pending",
    createdAt: booking?.createdAt
      ? new Date(booking.createdAt).toISOString()
      : null,
    updatedAt: booking?.updatedAt
      ? new Date(booking.updatedAt).toISOString()
      : null,
  };
}

export function countBookingsByStatus(bookings) {
  const counts = { pending: 0, accepted: 0, rejected: 0, cancelled: 0 };

  for (const booking of bookings) {
    if (booking.status in counts) {
      counts[booking.status] += 1;
    }
  }

  return counts;
}
