"use client";

import { toast } from "sonner";
import { ArrowRight, CalendarHeart } from "lucide-react";

export default function BookingRequestButton({ serviceTitle }) {
  return (
    <button
      type="button"
      onClick={() =>
        toast.info("Booking requests open soon", {
          description: `You'll be able to request ${serviceTitle} right from here.`,
        })
      }
      className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 hover:from-rose-400 hover:to-pink-400"
    >
      <CalendarHeart className="h-4 w-4" />
      Request booking
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
