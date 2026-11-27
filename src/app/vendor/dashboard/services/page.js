import Link from "next/link";
import { connection } from "next/server";
import { CreditCard } from "lucide-react";

import DashboardShell from "@/components/dashboard/DashboardShell";
import VendorServicesManager from "@/components/dashboard/VendorServicesManager";
import { buttonVariants } from "@/components/ui/button";
import { requirePageAccess } from "@/lib/auth-guards";
import { getVendorServiceDocuments } from "@/lib/dashboard-queries";
import { getVendorPlan } from "@/lib/plans";
import { serializeService } from "@/lib/services";
import { cn } from "cn";

export const instant = false;

export default async function VendorServicesPage() {
  await connection();

  const session = await requirePageAccess(["vendor"]);
  const services = (await getVendorServiceDocuments(session.user)).map(
    serializeService
  );
  const plan = getVendorPlan(session.user);

  return (
    <DashboardShell
      role="vendor"
      title="My services"
      description="Add packages, upload images, update listings, manage availability, and follow each service through admin approval."
      badge={plan === "premium" ? "Premium vendor" : "Free plan"}
      actions={
        <Link
          href="/vendor/dashboard/subscription"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-xl"
          )}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          View subscription
        </Link>
      }
    >
      <VendorServicesManager initialServices={services} plan={plan} />
    </DashboardShell>
  );
}
