import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ReceiptText,
  Store,
  UserCog,
  Users,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/admin";
import { db } from "@/lib/db";

export const instant = false;

export default async function AdminDashboardPage() {
  const session = await requireAdminPage();

  const [roleCounts, serviceCounts, transactionSummary] = await Promise.all([
    db
      .collection("user")
      .aggregate([
        {
          $group: {
            _id: { $ifNull: ["$role", "customer"] },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
    db
      .collection("services")
      .aggregate([
        {
          $group: {
            _id: { $ifNull: ["$status", "pending"] },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
    db
      .collection("transactions")
      .aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            volume: { $sum: { $ifNull: ["$amount", 0] } },
          },
        },
      ])
      .toArray(),
  ]);

  const usersByRole = { customer: 0, vendor: 0, admin: 0 };

  for (const row of roleCounts) {
    if (row._id in usersByRole) {
      usersByRole[row._id] = row.count;
    }
  }

  const totalUsers = usersByRole.customer + usersByRole.vendor + usersByRole.admin;

  const servicesByStatus = { pending: 0, published: 0, rejected: 0 };

  for (const row of serviceCounts) {
    if (row._id in servicesByStatus) {
      servicesByStatus[row._id] = row.count;
    }
  }

  const totalServices =
    servicesByStatus.pending +
    servicesByStatus.published +
    servicesByStatus.rejected;

  const transactions = transactionSummary[0] ?? { count: 0, volume: 0 };

  const stats = [
    {
      label: "Registered users",
      value: totalUsers,
      detail: `${usersByRole.customer} customers · ${usersByRole.vendor} vendors · ${usersByRole.admin} admins`,
      icon: Users,
      tone: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Published services",
      value: servicesByStatus.published,
      detail: `${servicesByStatus.pending} awaiting review · ${totalServices} total`,
      icon: Store,
      tone: "bg-rose-50 text-rose-600",
    },
    {
      label: "Platform transactions",
      value: transactions.count,
      detail: `$${Number(transactions.volume).toLocaleString()} total volume`,
      icon: ReceiptText,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Signed in as",
      value: session.user.name?.split(" ")[0] || "Admin",
      detail: session.user.email,
      icon: BadgeCheck,
      tone: "bg-amber-50 text-amber-600",
    },
  ];

  const capabilities = [
    {
      title: "Manage registered users",
      description:
        "Search every account, review roles, promote vendors, and remove abusive users.",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Manage vendors and customers",
      description:
        "Switch an account between customer, vendor, and admin as your platform grows.",
      href: "/admin/users?role=vendor",
      icon: UserCog,
    },
    {
      title: "Review published services",
      description:
        "Approve, unpublish, reject, and edit services before couples see them.",
      href: "/admin/services",
      icon: Store,
    },
    {
      title: "View platform transactions",
      description:
        "Monitor payment activity and revenue across the marketplace.",
      href: "/admin/transactions",
      icon: ReceiptText,
    },
  ];

  return (
    <AdminShell
      title={`Welcome, ${session.user.name?.split(" ")[0] || "Admin"}`}
      description="Manage users, review published services, and monitor platform transactions from one secure console."
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {stat.label}
                </span>
                <span className={`rounded-xl p-2 ${stat.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-3 truncate text-3xl font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {stat.detail}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {capabilities.map((capability, index) => {
          const Icon = capability.icon;

          return (
            <Link
              key={capability.title}
              href={capability.href}
              className="group animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>

                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
              </div>

              <h2 className="mt-4 font-semibold text-slate-900">
                {capability.title}
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {capability.description}
              </p>
            </Link>
          );
        })}
      </section>
    </AdminShell>
  );
}
