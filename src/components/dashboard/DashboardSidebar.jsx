"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarHeart,
  CreditCard,
  Heart,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Settings,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
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

function SidebarContent({ role, badge, links, pathname, onNavigate }) {
  const roleLabel = getRoleLabel(role);

  const isActive = (href) =>
    pathname === href ||
    (href !== `/${role}/dashboard` && pathname.startsWith(`${href}/`));

  const linkClassName = (active) =>
    cn(
      "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
      active
        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-200"
        : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
    );

  return (
    <div className="flex h-full flex-col gap-5 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
          <Heart className="h-5 w-5" fill="currentColor" />
        </div>

        <div className="min-w-0">
          <p className="text-lg font-bold tracking-tight text-slate-900">
            WedPlan
          </p>
          <p className="truncate text-xs font-semibold text-rose-500">
            {roleLabel} workspace
          </p>
        </div>
      </div>

      {badge ? (
        <div className="rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-2 text-xs font-semibold text-rose-600">
          {badge}
        </div>
      ) : null}

      <nav aria-label={`${roleLabel} navigation`} className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={linkClassName(active)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
              {active ? (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 pt-4">
        <Link
          href="/profile"
          onClick={onNavigate}
          className={linkClassName(pathname === "/profile")}
        >
          <Settings className="h-4 w-4" />
          Profile settings
        </Link>

        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <UserRound className="h-4 w-4" />
          Back to website
        </Link>
      </div>

      <p className="mt-auto hidden rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-4 text-xs leading-relaxed text-rose-500 lg:block">
        Every great wedding starts with the right people. Keep your plans
        organized from one place.
      </p>
    </div>
  );
}

export default function DashboardSidebar({ role = "customer", badge }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = linksByRole[role] ?? linksByRole.customer;
  const roleLabel = getRoleLabel(role);

  return (
    <>
      <div className="sticky top-20 z-30 border-b border-rose-100 bg-white/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
              <Heart className="h-4 w-4" fill="currentColor" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-slate-900">
                WedPlan
              </p>
              <p className="truncate text-[11px] font-semibold text-rose-500">
                {roleLabel} workspace
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <Menu className="mr-2 h-4 w-4" />
            Menu
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[min(88vw,20rem)] border-rose-100 bg-[#fffafb] p-0"
        >
          <SheetTitle className="sr-only">
            {roleLabel} workspace navigation
          </SheetTitle>
          <SheetDescription className="sr-only">
            Open dashboard sections, profile settings, and the public website.
          </SheetDescription>
          <SidebarContent
            role={role}
            badge={badge}
            links={links}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <aside className="hidden w-72 shrink-0 border-r border-rose-100 bg-white/85 lg:block">
        <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <SidebarContent
            role={role}
            badge={badge}
            links={links}
            pathname={pathname}
          />
        </div>
      </aside>
    </>
  );
}
