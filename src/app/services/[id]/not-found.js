import Link from "next/link";
import { ArrowLeft, HeartCrack, Search } from "lucide-react";

export default function ServiceNotFound() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#fff8fa] px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200">
          <HeartCrack className="h-8 w-8" />
        </span>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
          404 · Service not found
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          This wedding detail has moved on
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
          The service link may be incorrect, or the listing is no longer
          published. Browse the marketplace to find more trusted wedding
          vendors.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/services"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-rose-400 hover:to-pink-400"
          >
            <Search className="h-4 w-4" />
            Browse all services
          </Link>

          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
