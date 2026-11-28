"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-slate-400 transition hover:text-rose-400"
    >
      Back to top
      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
