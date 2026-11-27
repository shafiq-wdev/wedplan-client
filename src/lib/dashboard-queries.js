import {
  getServiceImageMap,
  getVendorServiceFilter,
  serializeBooking,
} from "./dashboard-data";
import { db } from "./db";

export async function getVendorServiceDocuments(user) {
  return db
    .collection("services")
    .find(getVendorServiceFilter(user))
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
}

export async function getCustomerBookings(customerId) {
  const bookings = await db
    .collection("bookings")
    .find({ customerId: String(customerId) })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const serviceIds = bookings
    .map((booking) => booking.serviceId)
    .filter(Boolean);

  const services = serviceIds.length
    ? await db
        .collection("services")
        .find({ _id: { $in: serviceIds } })
        .project({ image: 1, images: 1 })
        .toArray()
    : [];

  const imageMap = getServiceImageMap(services);

  return bookings.map((booking) => serializeBooking(booking, imageMap));
}

export async function getVendorBookings(user) {
  const services = await getVendorServiceDocuments(user);
  const serviceIds = services.map((service) => service._id);

  const conditions = [{ vendorId: String(user?.id ?? "") }];

  if (serviceIds.length > 0) {
    conditions.push({ serviceId: { $in: serviceIds } });
  }

  const bookings = await db
    .collection("bookings")
    .find({ $or: conditions })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const imageMap = getServiceImageMap(services);

  return bookings.map((booking) => serializeBooking(booking, imageMap));
}
