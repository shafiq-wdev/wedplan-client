"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import StatusBadge from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BOOKING_FILTERS,
  filterBookings,
  formatEventDate,
  formatRequestDate,
  getBookingCounts,
  initials,
} from "@/lib/booking-ui";
import { cn } from "cn";

const statusPresentation = {
  pending: {
    note: "New enquiry — review the details and choose an outcome.",
    noteClass: "bg-amber-50 text-amber-700",
    accent: "border-l-amber-300",
  },
  accepted: {
    note: "Accepted by you. This request is closed and cannot be changed.",
    noteClass: "bg-emerald-50 text-emerald-700",
    accent: "border-l-emerald-300",
  },
  rejected: {
    note: "Rejected by you. This request is closed and cannot be changed.",
    noteClass: "bg-rose-50 text-rose-700",
    accent: "border-l-rose-300",
  },
  cancelled: {
    note: "The customer cancelled this request. No action is needed.",
    noteClass: "bg-slate-100 text-slate-600",
    accent: "border-l-slate-300",
  },
};

const accentIcons = {
  pending: Clock3,
  accepted: CheckCircle2,
  rejected: Ban,
  cancelled: XCircle,
};

const searchKeys = [
  "serviceName",
  "customerName",
  "customerEmail",
  "eventLocation",
  "eventDate",
  "status",
];

export default function VendorBookingsManager({ initialBookings = [] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [busyId, setBusyId] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => getBookingCounts(bookings), [bookings]);
  const visibleBookings = useMemo(
    () => filterBookings(bookings, filter, query, searchKeys),
    [bookings, filter, query]
  );

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

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm shadow-rose-100/40 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Incoming requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {counts.pending} need your review · {counts.all} total requests
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer, service, or location"
              aria-label="Search booking requests"
              className="h-10 rounded-xl border-rose-100 bg-white pl-9"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {BOOKING_FILTERS.map((item) => {
            const active = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={active}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  active
                    ? "border-rose-300 bg-rose-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/40"
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.14em]",
                    active ? "text-rose-500" : "text-slate-400"
                  )}
                >
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {counts[item.value]}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {visibleBookings.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-rose-200 bg-white p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <CalendarDays className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-semibold text-slate-900">
            {bookings.length === 0
              ? "No booking requests yet"
              : "No requests match your filters"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {bookings.length === 0
              ? "New requests for your published services will appear here."
              : "Try a different status or search term to see more requests."}
          </p>

          {bookings.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
              className="mt-5 rounded-xl"
            >
              Clear filters
            </Button>
          ) : null}
        </section>
      ) : (
        <div className="space-y-4">
          {visibleBookings.map((booking) => {
            const busy = busyId === booking.id;
            const canProcess = booking.status === "pending";
            const presentation =
              statusPresentation[booking.status] ?? statusPresentation.pending;
            const AccentIcon =
              accentIcons[booking.status] ?? accentIcons.pending;

            return (
              <article
                key={booking.id}
                className={cn(
                  "animate-fade-up overflow-hidden rounded-3xl border border-l-4 border-rose-100 bg-white shadow-sm",
                  presentation.accent
                )}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-rose-50 sm:h-28 sm:w-32">
                    {booking.serviceImage ? (
                      <Image
                        src={booking.serviceImage}
                        alt={booking.serviceName}
                        fill
                        sizes="128px"
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
                      <h3 className="break-words text-base font-semibold text-slate-900">
                        {booking.serviceName}
                      </h3>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="mt-3 flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-xs font-bold text-white">
                        {initials(booking.customerName || "Customer")}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <UserRound className="h-3.5 w-3.5 text-rose-400" />
                          {booking.customerName || "Customer"}
                        </p>
                        {booking.customerEmail ? (
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                            <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                            {booking.customerEmail}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <CalendarDays className="h-4 w-4 shrink-0 text-rose-400" />
                        <span className="min-w-0">
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Event date
                          </span>
                          <span className="font-medium text-slate-700">
                            {formatEventDate(booking.eventDate)}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 text-rose-400" />
                        <span className="min-w-0">
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Event location
                          </span>
                          <span className="block truncate font-medium text-slate-700">
                            {booking.eventLocation}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        <MessageSquare className="h-3.5 w-3.5 text-rose-400" />
                        Customer message
                      </p>
                      <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-600">
                        {booking.message || "No message was included with this request."}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs leading-relaxed",
                        presentation.noteClass
                      )}
                    >
                      <AccentIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      {presentation.note}
                    </div>

                    <p className="mt-3 text-[11px] text-slate-400">
                      Requested {formatRequestDate(booking.createdAt)} ·
                      Updated {formatRequestDate(booking.updatedAt)} · Reference{" "}
                      <span className="font-mono">
                        {booking.id.slice(-8).toUpperCase()}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 sm:w-36 sm:flex-col">
                    <p
                      className={cn(
                        "mb-1 hidden text-[10px] font-semibold uppercase tracking-[0.12em] sm:block",
                        canProcess ? "text-amber-600" : "text-slate-400"
                      )}
                    >
                      {canProcess ? "Awaiting decision" : "Decision locked"}
                    </p>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => updateStatus(booking, "accepted")}
                      disabled={!canProcess || busy}
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      {busy && canProcess ? (
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
                      disabled={!canProcess || busy}
                      className="flex-1 rounded-xl disabled:border-slate-200 disabled:text-slate-400"
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>

                    {!canProcess ? (
                      <p className="hidden text-[11px] leading-snug text-slate-400 sm:block">
                        Only pending requests can be changed.
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
