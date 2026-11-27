"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageSquare,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import StatusBadge from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";

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

export default function VendorBookingsManager({ initialBookings = [] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [busyId, setBusyId] = useState("");

  const updateStatus = async (booking, status) => {
    setBusyId(booking.id);

    try {
      const response = await fetch(`/api/vendor/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update booking request.");
      }

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id ? data.booking : item
        )
      );
      toast.success(
        status === "accepted"
          ? "Booking request accepted."
          : "Booking request rejected."
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-rose-300" />
        <h2 className="mt-3 font-semibold text-slate-900">
          No booking requests yet
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          New requests for your published services will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const busy = busyId === booking.id;
        const canProcess = booking.status === "pending";

        return (
          <article
            key={booking.id}
            className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-rose-50 sm:w-28">
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

                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <UserRound className="h-3.5 w-3.5 text-rose-400" />
                  {booking.customerName || "Customer"}
                  {booking.customerEmail ? ` · ${booking.customerEmail}` : ""}
                </p>

                <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-rose-400" />
                    {formatEventDate(booking.eventDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                    {booking.eventLocation}
                  </span>
                </div>

                <p className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                  {booking.message || "No message provided."}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Requested {formatRequestDate(booking.createdAt)} · Reference{" "}
                  {booking.id.slice(-8).toUpperCase()}
                </p>
              </div>

              {canProcess ? (
                <div className="flex gap-2 sm:flex-col">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => updateStatus(booking, "accepted")}
                    disabled={busy}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  >
                    {busy ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                    )}
                    Accept
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(booking, "rejected")}
                    disabled={busy}
                    className="rounded-lg"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
