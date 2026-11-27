"use client";

import { Check, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { VENDOR_PLANS } from "@/lib/plans";
import { cn } from "cn";

export default function VendorSubscriptionPlans({
  currentPlan = "free",
  activeCount = 0,
}) {
  const handleUpgrade = () => {
    toast.info("Stripe Checkout will be available in the payment section.");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">
          Currently on the {currentPlan === "premium" ? "Premium" : "Free"} plan
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {currentPlan === "premium"
            ? "You can publish unlimited active services."
            : `${activeCount} of 3 active services in use.`}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {Object.values(VENDOR_PLANS).map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isPremium = plan.id === "premium";

          return (
            <article
              key={plan.id}
              className={cn(
                "animate-fade-up rounded-[1.5rem] border bg-white p-6 shadow-sm transition",
                isCurrent
                  ? "border-rose-300 ring-2 ring-rose-100"
                  : "border-rose-100"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      isPremium
                        ? "bg-amber-100 text-amber-600"
                        : "bg-rose-100 text-rose-500"
                    )}
                  >
                    {isPremium ? (
                      <Crown className="h-5 w-5" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {plan.label}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {plan.price === 0
                        ? "Free forever"
                        : `$${plan.price} per month`}
                    </p>
                  </div>
                </div>

                {isPremium ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                    Premium badge
                  </span>
                ) : null}
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {isCurrent ? (
                  <div className="rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-600">
                    Current plan
                  </div>
                ) : isPremium ? (
                  <Button
                    type="button"
                    onClick={handleUpgrade}
                    className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                ) : (
                  <div className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm text-slate-500">
                    Default plan
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
