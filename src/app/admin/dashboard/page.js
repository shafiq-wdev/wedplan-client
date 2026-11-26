import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  BarChart3,
  ShieldCheck,
  Users,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/roles";

export const instant = false;

const cards = [
  {
    title: "User management",
    description:
      "Review customer and vendor accounts across the platform.",
    icon: Users,
  },
  {
    title: "Vendor oversight",
    description:
      "Monitor listings, activity, and platform quality.",
    icon: BarChart3,
  },
  {
    title: "Platform settings",
    description:
      "Manage secure administrative configuration.",
    icon: ShieldCheck,
  },
];

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const role = session.user.role || "customer";

  if (role !== "admin") {
    redirect(getDashboardPath(role));
  }

  return (
    <DashboardShell
      roleLabel="Admin"
      title="Platform overview"
      description="Admin access is provisioned securely outside public registration. Use this space to review accounts and keep the platform healthy."
      cards={cards}
    />
  );
}
