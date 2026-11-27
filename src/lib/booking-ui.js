export const BOOKING_STATUSES = ["pending", "accepted", "rejected", "cancelled"];

export const BOOKING_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export function formatEventDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRequestDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function initials(value) {
  return (
    String(value ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "WP"
  );
}

export function getBookingCounts(bookings) {
  const counts = { all: bookings.length, pending: 0, accepted: 0, rejected: 0, cancelled: 0 };

  for (const booking of bookings) {
    if (booking.status in counts) {
      counts[booking.status] += 1;
    }
  }

  return counts;
}

export function filterBookings(bookings, status, query, searchKeys = []) {
  const term = query.trim().toLowerCase();

  return bookings.filter((booking) => {
    const matchesStatus = status === "all" || booking.status === status;
    const matchesQuery =
      !term ||
      searchKeys.some((key) =>
        String(booking[key] ?? "").toLowerCase().includes(term)
      );

    return matchesStatus && matchesQuery;
  });
}
