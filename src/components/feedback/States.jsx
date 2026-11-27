import Link from "next/link";
import { ArrowLeft, HeartCrack, RefreshCw, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

function StateShell({ icon: Icon, eyebrow, title, description, children }) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#fff8fa] px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200">
          <Icon className="h-8 w-8" />
        </span>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
          {eyebrow}
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
          {description}
        </p>

        {children ? (
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this page right now. Please try again.",
  retry,
}) {
  return (
    <StateShell
      icon={RefreshCw}
      eyebrow="Unexpected error"
      title={title}
      description={description}
    >
      {retry ? (
        <button
          type="button"
          onClick={retry}
          className={cn(
            buttonVariants(),
            "rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-white"
          )}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </button>
      ) : null}

      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "rounded-full border-rose-200 px-6 py-3 text-rose-600"
        )}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back home
      </Link>
    </StateShell>
  );
}

export function NotFoundState({
  title = "We could not find that page",
  description = "The link may be incorrect, or the page may have moved. Explore WedPlan to find what you need.",
}) {
  return (
    <StateShell
      icon={HeartCrack}
      eyebrow="404 · Not found"
      title={title}
      description={description}
    >
      <Link
        href="/services"
        className={cn(
          buttonVariants(),
          "rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-white"
        )}
      >
        <Search className="mr-2 h-4 w-4" />
        Browse services
      </Link>

      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "rounded-full border-rose-200 px-6 py-3 text-rose-600"
        )}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back home
      </Link>
    </StateShell>
  );
}
