import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarCheck,
  Store,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/roles";

export const instant = false;

const cards = [
  {
    title: "Manage services",
    description:
      "Showcase your packages, pricing, and availability to couples.",
    icon: Store,
  },
  {
    title: "Booking requests",
    description:
      "Review enquiries and keep every conversation in one place.",
    icon: CalendarCheck,
  },
  {
    title: "Business profile",
    description:
      "Keep your public vendor profile accurate and up to date.",
    icon: BriefcaseBusiness,
  },
];

export default async function VendorDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const role = session.user.role || "customer";

  if (role !== "vendor") {
    redirect(getDashboardPath(role));
  }

  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <DashboardShell
      roleLabel="Vendor"
      title={`Welcome, ${firstName}`}
      description="Grow your wedding business with WedPlan. Manage your services, respond to couples, and keep your profile ready for new bookings."
      cards={cards}
    />
  );
}
