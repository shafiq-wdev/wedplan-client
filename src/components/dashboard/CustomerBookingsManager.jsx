"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  TicketCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import StatusBadge from "@/components/dashboard/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BOOKING_FILTERS,
  filterBookings,
  formatEventDate,
  formatRequestDate,
  getBookingCounts,
} from "@/lib/booking-ui";
import { cn } from "cn";

const statusPresentation = {
  pending: {
    icon: Clock3,
    note: "Waiting for the vendor to accept or reject this request.",
    noteClass: "bg-amber-50 text-amber-700",
    accent: "border-l-amber-300",
  },
  accepted: {
    icon: CheckCircle2,
    note: "The vendor accepted this request. You can now plan the details.",
    noteClass: "bg-emerald-50 text-emerald-700",
    accent: "border-l-emerald-300",
  },
  rejected: {
    icon: Ban,
    note: "The vendor declined this request. You can send a new enquiry anytime.",
    noteClass: "bg-rose-50 text-rose-700",
    accent: "border-l-rose-300",
  },
  cancelled: {
    icon: XCircle,
    note: "You cancelled this request. It is no longer active.",
    noteClass: "bg-slate-100 text-slate-600",
    accent: "border-l-slate-300",
  },
};

const searchKeys = ["serviceName", "vendorName", "eventLocation", "eventDate", "status"];

export default function CustomerBookingsManager({ initialBookings = [] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [busyId, setBusyId] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => getBookingCounts(bookings), [bookings]);
  const visibleBookings = useMemo(
    () => filterBookings(bookings, filter, query, searchKeys),
    [bookings, filter, query]
  );

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

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm shadow-rose-100/40 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Request history
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {counts.all} total · {counts.pending} awaiting a vendor response
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search service, vendor, or location"
              aria-label="Search booking requests"
              className="h-10 rounded-xl border-rose-100 bg-white pl-9"
            />
          </div>
        </div>

        <div
          className="mt-5 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter booking requests"
        >
          {BOOKING_FILTERS.map((item) => {
            const active = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                  active
                    ? "bg-rose-500 text-white shadow-sm shadow-rose-200"
                    : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-white text-slate-500"
                  )}
                >
                  {counts[item.value]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {visibleBookings.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-rose-200 bg-white p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <TicketCheck className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-semibold text-slate-900">
            {bookings.length === 0
              ? "No booking requests yet"
              : "No requests match your filters"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {bookings.length === 0
              ? "Browse wedding services and send your first enquiry."
              : "Try a different status or search term to see more requests."}
          </p>

          {bookings.length === 0 ? (
            <Link
              href="/services"
              className={cn(
                buttonVariants(),
                "mt-5 rounded-xl bg-rose-500 hover:bg-rose-600"
              )}
            >
              Browse services
            </Link>
          ) : (
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
          )}
        </section>
      ) : (
        <div className="space-y-4">
          {visibleBookings.map((booking) => {
            const expanded = expandedId === booking.id;
            const busy = busyId === booking.id;
            const presentation =
              statusPresentation[booking.status] ?? statusPresentation.pending;
            const NoteIcon = presentation.icon;

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

                    <p className="mt-1 text-xs text-slate-500">
                      {booking.vendorName || "Vendor"} · Requested{" "}
                      {formatRequestDate(booking.createdAt)}
                    </p>

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

                    <div
                      className={cn(
                        "mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs leading-relaxed",
                        presentation.noteClass
                      )}
                    >
                      <NoteIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      {presentation.note}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:w-32 sm:flex-col">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpandedId(expanded ? "" : booking.id)
                      }
                      aria-expanded={expanded}
                      className="flex-1 rounded-xl"
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
                        className="flex-1 rounded-xl"
                      >
                        {busy ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-1 h-4 w-4" />
                        )}
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </div>

                {expanded ? (
                  <div className="grid gap-4 border-t border-slate-100 bg-slate-50/40 p-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        <MessageSquare className="h-4 w-4 text-rose-400" />
                        Message to vendor
                      </p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                        {booking.message || "No message was included with this request."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Request record
                      </p>
                      <dl className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-400">Vendor</dt>
                          <dd className="text-right font-medium text-slate-700">
                            {booking.vendorName || "—"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-400">Reference</dt>
                          <dd className="font-mono font-medium text-slate-700">
                            {booking.id.slice(-8).toUpperCase()}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-400">Submitted</dt>
                          <dd className="font-medium text-slate-700">
                            {formatRequestDate(booking.createdAt)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-400">Last updated</dt>
                          <dd className="font-medium text-slate-700">
                            {formatRequestDate(booking.updatedAt)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
