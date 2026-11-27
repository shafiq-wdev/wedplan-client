"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  Loader2,
  MapPin,
  MessageSquare,
  TicketCheck,
} from "lucide-react";
import { toast } from "sonner";

import StatusBadge from "@/components/dashboard/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

function formatEventDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRequestDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomerBookingsManager({ initialBookings = [] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [busyId, setBusyId] = useState("");
  const [expandedId, setExpandedId] = useState("");

  const cancelBooking = async (booking) => {
    setBusyId(booking.id);

    try {
      const response = await fetch(`/api/customer/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to cancel this request.");
      }

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id ? data.booking : item
        )
      );
      toast.success("Booking request cancelled.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center">
        <TicketCheck className="mx-auto h-8 w-8 text-rose-300" />
        <h2 className="mt-3 font-semibold text-slate-900">
          No booking requests yet
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Browse wedding services and send your first enquiry.
        </p>
        <Link
          href="/services"
          className={cn(
            buttonVariants(),
            "mt-5 rounded-xl bg-rose-500 hover:bg-rose-600"
          )}
        >
          Browse services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const expanded = expandedId === booking.id;
        const busy = busyId === booking.id;

        return (
          <article
            key={booking.id}
            className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-rose-50 sm:h-20 sm:w-28">
                {booking.serviceImage ? (
                  <Image
                    src={booking.serviceImage}
                    alt={booking.serviceName}
                    fill
                    sizes="112px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-rose-400">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900">
                    {booking.serviceName}
                  </h2>
                  <StatusBadge status={booking.status} />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {booking.vendorName || "Vendor"} · Requested{" "}
                  {formatRequestDate(booking.createdAt)}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-rose-400" />
                    {formatEventDate(booking.eventDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                    {booking.eventLocation}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:flex-col">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setExpandedId(expanded ? "" : booking.id)
                  }
                  className="rounded-lg"
                >
                  <ChevronDown
                    className={cn(
                      "mr-1 h-4 w-4 transition",
                      expanded && "rotate-180"
                    )}
                  />
                  Details
                </Button>

                {booking.status === "pending" ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => cancelBooking(booking)}
                    disabled={busy}
                    className="rounded-lg"
                  >
                    {busy ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : null}
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>

            {expanded ? (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Vendor
                  </p>
                  <p className="mt-1">
                    {booking.vendorName || "Not provided"}
                    {booking.customerEmail ? ` · ${booking.customerEmail}` : ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Message
                  </p>
                  <p className="mt-1 flex items-start gap-2">
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                    {booking.message || "No message provided."}
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  Reference: {booking.id.slice(-8).toUpperCase()}
                </p>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
