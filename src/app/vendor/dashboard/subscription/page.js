import { connection } from "next/server";

import DashboardShell from "@/components/dashboard/DashboardShell";
import VendorSubscriptionPlans from "@/components/dashboard/VendorSubscriptionPlans";
import { requirePageAccess } from "@/lib/auth-guards";
import { getVendorServiceDocuments } from "@/lib/dashboard-queries";
import { getVendorPlan } from "@/lib/plans";

export const instant = false;

export default async function VendorSubscriptionPage() {
  await connection();

  const session = await requirePageAccess(["vendor"]);
  const services = await getVendorServiceDocuments(session.user);
  const activeCount = services.filter(
    (service) => service.status === "published"
  ).length;
  const plan = getVendorPlan(session.user);
  const expiresAt = session.user.subscriptionExpiresAt
    ? new Date(session.user.subscriptionExpiresAt)
    : null;
  const expiresAtLabel =
    expiresAt && Number.isFinite(expiresAt.getTime())
      ? expiresAt.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";

  return (
    <DashboardShell
      role="vendor"
      title="Subscription plans"
      description="Free vendors can publish up to 3 active services. Premium vendors get unlimited listings and a Premium badge."
      badge={plan === "premium" ? "Premium vendor" : "Free plan"}
    >
      <VendorSubscriptionPlans
        currentPlan={plan}
        activeCount={activeCount}
        expiresAtLabel={expiresAtLabel}
      />
    </DashboardShell>
  );
}
