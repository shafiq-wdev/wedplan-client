import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  CalendarHeart,
  HeartHandshake,
  Wallet,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/roles";

export const instant = false;

const cards = [
  {
    title: "Browse vendors",
    description:
      "Explore trusted photographers, venues, planners, and more.",
    icon: HeartHandshake,
  },
  {
    title: "My bookings",
    description:
      "Keep track of every vendor you have booked and what comes next.",
    icon: CalendarHeart,
  },
  {
    title: "Wedding budget",
    description:
      "Stay on top of your spending and plan for the details that matter.",
    icon: Wallet,
  },
];

export default async function CustomerDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const role = session.user.role || "customer";

  if (role !== "customer") {
    redirect(getDashboardPath(role));
  }

  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <DashboardShell
      roleLabel="Customer"
      title={`Welcome, ${firstName}`}
      description="Your wedding planning space is ready. Discover vendors, manage bookings, and keep every detail of your special day organized."
      cards={cards}
    />
  );
}
