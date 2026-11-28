import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "cn";

export default function DashboardSectionHeading({
  title,
  description,
  href,
  linkLabel = "View all",
  action,
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="h-1 w-8 shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-400" />
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            {title}
          </h2>
        </div>

        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      {action ??
        (href ? (
          <Link
            href={href}
            className={cn(
              "inline-flex items-center gap-1 text-sm font-semibold text-rose-500 transition hover:text-rose-600"
            )}
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null)}
    </div>
  );
}
