"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, CalendarCheck2, Loader2, Send, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyForm = {
  eventDate: "",
  eventLocation: "",
  message: "",
};

export default function BookingForm({ serviceId, serviceTitle, vendorName }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const today = new Date().toISOString().slice(0, 10);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitBooking(event) {
    event.preventDefault();
    setSubmitting(true);

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
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (booking) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
          <CalendarCheck2 className="h-6 w-6" />
        </span>

        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Request submitted
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          Your request for <strong>{serviceTitle}</strong> is now pending. The
          vendor can review it from their dashboard.
        </p>

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Reference {booking.id?.slice(-8).toUpperCase()}
        </p>

        <Link
          href="/services"
          className="group mt-5 inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Browse more services
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitBooking}
      className="rounded-3xl border border-rose-100 bg-rose-50/40 p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm">
          <CalendarCheck2 className="h-5 w-5" />
        </span>

        <div>
          <h3 className="font-semibold text-slate-900">Request this service</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Send a booking request for <strong>{serviceTitle}</strong> to{" "}
            <strong>{vendorName || "the vendor"}</strong>. Your account details
            are attached automatically.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Event date</Label>
          <Input
            id="eventDate"
            type="date"
            min={today}
            required
            value={form.eventDate}
            onChange={(event) => updateField("eventDate", event.target.value)}
            className="h-10 rounded-xl border-rose-200 bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventLocation">Event location</Label>
          <Input
            id="eventLocation"
            required
            minLength={3}
            maxLength={200}
            value={form.eventLocation}
            onChange={(event) =>
              updateField("eventLocation", event.target.value)
            }
            placeholder="City or venue"
            className="h-10 rounded-xl border-rose-200 bg-white"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="bookingMessage">Additional message (optional)</Label>
        <textarea
          id="bookingMessage"
          rows={3}
          maxLength={1000}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder="Tell the vendor about your celebration, guest count, or anything they should know."
          className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-white hover:from-rose-400 hover:to-pink-400"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send booking request
            </>
          )}
        </Button>

        <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          No payment is taken here.
        </p>
      </div>
    </form>
  );
}
