"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RefreshButton({ label = "Refresh status" }) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={refreshing}
      onClick={() => {
        setRefreshing(true);
        router.refresh();
        window.setTimeout(() => setRefreshing(false), 800);
      }}
      className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
    >
      {refreshing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
