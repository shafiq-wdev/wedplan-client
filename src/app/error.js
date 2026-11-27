"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/feedback/States";

export default function GlobalRouteError({ error, retry }) {
  useEffect(() => {
    console.error("WedPlan route error:", error);
  }, [error]);

  return (
    <ErrorState
      title="We could not load this page"
      description="Something went wrong while preparing this page. Your data is safe — please try again."
      retry={retry}
    />
  );
}
