"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarHeart,
  CreditCard,
  Heart,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "cn";

import { getRoleLabel } from "@/lib/roles";

const linksByRole = {
  customer: [
    {
      href: "/customer/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/customer/dashboard/bookings",
      label: "My bookings",
      icon: CalendarHeart,
    },
    { href: "/services", label: "Browse services", icon: Store },
  ],
  vendor: [
    {
      href: "/vendor/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/vendor/dashboard/services",
      label: "My services",
      icon: Store,
    },
    {
      href: "/vendor/dashboard/bookings",
      label: "Booking requests",
      icon: CalendarHeart,
    },
    {
      href: "/vendor/dashboard/subscription",
      label: "Subscription",
      icon: CreditCard,
    },
  ],
  admin: [
    {
      href: "/admin/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
    },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/services", label: "Services", icon: Store },
    {
      href: "/admin/transactions",
      label: "Transactions",
      icon: ReceiptText,
    },
  ],
};

export default function DashboardSidebar({ role = "customer", badge }) {
  const pathname = usePathname();
  const links = linksByRole[role] ?? linksByRole.customer;

  return (
    <aside className="w-full shrink-0 border-b border-rose-100 bg-white/85 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="sticky top-20 flex flex-col gap-5 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>

          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-slate-900">
              WedPlan
            </p>
            <p className="truncate text-xs font-medium text-rose-500">
              {getRoleLabel(role)} workspace
            </p>
          </div>
        </div>

        {badge ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2 text-xs font-semibold text-rose-600">
            {badge}
          </div>
        ) : null}

        <nav aria-label={`${getRoleLabel(role)} navigation`} className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href !== `/${role}/dashboard` &&
                pathname.startsWith(`${link.href}/`));

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-rose-500 text-white shadow-sm shadow-rose-200"
                    : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-slate-100 pt-4">
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              pathname === "/profile"
                ? "bg-rose-500 text-white"
                : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
            )}
          >
            <Settings className="h-4 w-4" />
            Profile settings
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <UserRound className="h-4 w-4" />
            Back to website
          </Link>
        </div>

        <p className="hidden rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-4 text-xs leading-relaxed text-rose-500 lg:block">
          Every great wedding starts with the right people. Keep your plans
          organized from one place.
        </p>
      </div>
    </aside>
  );
}
