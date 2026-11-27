"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEventDate } from "@/lib/booking-ui";
import { cn } from "cn";

const emptyForm = {
  eventDate: "",
  eventLocation: "",
  message: "",
};

export default function BookingForm({
  serviceId,
  serviceTitle,
  vendorName,
  customerName,
  customerEmail,
  serviceLocation,
}) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitBooking(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          eventDate: form.eventDate,
          eventLocation: form.eventLocation,
          message: form.message,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send your booking request.");
      }

      toast.success("Booking request sent!", {
        description: `${vendorName || "The vendor"} will review your request.`,
      });
      setBooking(data.booking);
    } catch (requestError) {
      const message =
        requestError.message || "Unable to send your booking request.";

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (booking) {
    return (
      <section className="animate-fade-up overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-100/40">
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 px-6 py-6 text-white">
          <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border border-white/20" />
          <div className="pointer-events-none absolute -bottom-16 right-16 h-28 w-28 rounded-full bg-white/10" />

          <div className="relative flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
              <CalendarCheck2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-50">
                Request submitted
              </p>
              <h3 className="mt-1 text-xl font-bold">Your request is pending</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50">
                We saved your request in the bookings collection. The selected
                vendor can now review it from their dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Service
              </p>
              <p className="mt-1.5 break-words text-sm font-semibold text-slate-900">
                {serviceTitle}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Selected vendor
              </p>
              <p className="mt-1.5 break-words text-sm font-semibold text-slate-900">
                {vendorName || "WedPlan vendor"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Event date
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-900">
                {formatEventDate(booking.eventDate)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Event location
              </p>
              <p className="mt-1.5 break-words text-sm font-semibold text-slate-900">
                {booking.eventLocation}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Reference {booking.id?.slice(-8).toUpperCase()}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <Clock3 className="h-3.5 w-3.5" />
                Pending
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-500">
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                Sent
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-amber-500 ring-1 ring-amber-200">
                  <Clock3 className="h-3.5 w-3.5" />
                </span>
                Vendor review
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                Dashboard update
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/customer/dashboard/bookings"
              className={cn(
                buttonVariants(),
                "h-11 rounded-xl bg-rose-500 px-5 hover:bg-rose-600"
              )}
            >
              Track this request
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl px-5"
              )}
            >
              Browse more services
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={submitBooking}
      className="animate-fade-up overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-xl shadow-rose-100/40"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-rose-400 px-6 py-6 text-white">
        <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border border-white/20" />
        <div className="pointer-events-none absolute -bottom-16 right-20 h-28 w-28 rounded-full bg-white/10" />

        <div className="relative flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <CalendarCheck2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-50">
              Booking request
            </p>
            <h3 className="mt-1 text-xl font-bold">Request this service</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-rose-50">
              Share a few event details. Your account and the selected vendor
              are identified automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <section
          aria-labelledby="bookingSummaryHeading"
          className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4"
        >
          <div className="flex items-center gap-2 text-rose-600">
            <Sparkles className="h-4 w-4" />
            <h4
              id="bookingSummaryHeading"
              className="text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Request summary
            </h4>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-rose-100 bg-white/80 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                <UserRound className="h-3.5 w-3.5 text-rose-400" />
                Customer
              </p>
              <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">
                {customerName || "Your account"}
              </p>
              {customerEmail ? (
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                  <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                  {customerEmail}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-rose-100 bg-white/80 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
                Selected vendor
              </p>
              <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">
                {vendorName || "WedPlan vendor"}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {serviceTitle}
              </p>
            </div>
          </div>

          {serviceLocation ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              Service based in <strong className="font-semibold text-slate-700">{serviceLocation}</strong>
            </p>
          ) : null}
        </section>

        <section className="space-y-4" aria-labelledby="eventDetailsHeading">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-xs font-bold text-rose-600">
              01
            </span>
            <div>
              <h4 id="eventDetailsHeading" className="text-sm font-semibold text-slate-900">
                Event details
              </h4>
              <p className="text-xs text-slate-500">
                Let the vendor know when and where your celebration happens.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event date</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
                <Input
                  id="eventDate"
                  type="date"
                  min={today}
                  required
                  value={form.eventDate}
                  onChange={(event) => updateField("eventDate", event.target.value)}
                  className="h-11 rounded-xl border-rose-100 bg-white pl-9"
                />
              </div>
              <p className="text-xs text-slate-400">Past dates cannot be selected.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventLocation">Event location</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-400" />
                <Input
                  id="eventLocation"
                  required
                  minLength={3}
                  maxLength={200}
                  value={form.eventLocation}
                  onChange={(event) =>
                    updateField("eventLocation", event.target.value)
                  }
                  placeholder="Venue or city"
                  className="h-11 rounded-xl border-rose-100 bg-white pl-9"
                />
              </div>
              <p className="text-xs text-slate-400">3–200 characters.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="messageHeading">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-xs font-bold text-rose-600">
              02
            </span>
            <div>
              <h4 id="messageHeading" className="text-sm font-semibold text-slate-900">
                Additional message
              </h4>
              <p className="text-xs text-slate-500">
                Optional, but it helps the vendor prepare a better reply.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookingMessage">
              Your note to {vendorName || "the vendor"}
            </Label>
            <textarea
              id="bookingMessage"
              rows={4}
              maxLength={1000}
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="Tell them about your guest count, theme, timing, or anything else they should know."
              className="w-full resize-none rounded-xl border border-rose-100 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
            <p className="text-right text-[11px] text-slate-400">
              {form.message.length}/1000 characters
            </p>
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Request not sent</p>
              <p className="mt-0.5 text-rose-600">{error}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-white shadow-lg shadow-rose-200 hover:from-rose-400 hover:to-pink-400 sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending request...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send booking request
              </>
            )}
          </Button>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            No payment is taken here. The vendor reviews your request first.
          </p>
        </div>
      </div>
    </form>
  );
}
