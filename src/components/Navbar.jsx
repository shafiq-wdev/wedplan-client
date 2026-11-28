"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "cn";

import {
  Heart,
  Menu,
  Home,
  LayoutDashboard,
  UserRound,
  LogOut,
  BriefcaseBusiness,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { clearBackendToken } from "@/lib/backend-auth";
import { getDashboardPath, getRoleLabel } from "@/lib/roles";

const publicLinks = [
  { name: "Home", href: "/", icon: Home },
  {
    name: "Browse Services",
    href: "/services",
    icon: BriefcaseBusiness,
  },
];

const isActive = (pathname, href) =>
  pathname === href || (href === "/services" && pathname.startsWith("/services/"));

function NavLinks({ pathname, onNavigate, mobile = false }) {
  return (
    <>
      {publicLinks.map((link) => {
        const Icon = link.icon;
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-rose-50 text-rose-600"
                : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
            )}
          >
            {mobile && <Icon size={18} />}
            {link.name}
          </Link>
        );
      })}
    </>
  );
}

export default function Navbar({ user: userProp = null, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const user = userProp ?? session?.user ?? null;

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        const { error } = await authClient.signOut();

        if (error) {
          throw new Error(error.message || "Logout failed.");
        }
      }

      await clearBackendToken();

      toast.success("Signed out successfully.");
      setOpen(false);
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Unable to sign out. Please try again."
      );
    }
  };

  const displayName = user?.name || "User";
  const profileImage = user?.image || user?.photoURL || user?.photo || "";

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
            <Heart size={23} fill="white" />
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Wed<span className="text-rose-500">Plan</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <NavLinks pathname={pathname} />
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Link
                href="/sign-in"
                className={buttonVariants({
                  variant: "ghost",
                  className:
                    "min-h-11 font-semibold text-slate-700 hover:text-rose-600",
                })}
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className={buttonVariants({
                  className:
                    "min-h-11 rounded-full bg-rose-500 px-6 font-semibold text-white hover:bg-rose-600",
                })}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger className="flex min-h-11 items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium transition-colors hover:bg-rose-50">
                <Avatar className="h-10 w-10 border-2 border-rose-100">
                  <AvatarImage src={profileImage} alt={displayName} />
                  <AvatarFallback className="bg-rose-100 font-semibold text-rose-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <span className="max-w-28 truncate font-semibold text-gray-700">
                  {displayName}
                </span>

                <ChevronDown size={16} />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60 rounded-xl p-2">
                <div className="flex flex-col gap-1 px-3 py-2">
                  <span className="font-semibold text-gray-900">
                    {displayName}
                  </span>

                  <span className="truncate text-xs font-normal text-gray-500">
                    {user.email}
                  </span>

                  <span className="text-xs font-medium text-rose-500">
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="min-h-11 cursor-pointer py-2"
                  render={<Link href={getDashboardPath(user.role)} />}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="min-h-11 cursor-pointer py-2"
                  render={<Link href="/profile" />}
                >
                  <UserRound className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer py-2 text-red-500 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="right" className="border-rose-100 bg-[#fffafb]">
              <SheetHeader className="text-left">
                <SheetTitle>WedPlan menu</SheetTitle>
                <SheetDescription>
                  Browse services or open your account workspace.
                </SheetDescription>
              </SheetHeader>

              <nav className="flex flex-col gap-2 pt-6">
                <NavLinks
                  pathname={pathname}
                  mobile
                  onNavigate={() => setMobileMenuOpen(false)}
                />

                {user ? (
                  <>
                    <Link
                      href={getDashboardPath(user.role)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <UserRound size={18} />
                      Profile Settings
                    </Link>

                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="min-h-11 justify-start rounded-xl text-rose-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className={buttonVariants({
                        variant: "outline",
                        className: "min-h-11 rounded-xl",
                      })}
                    >
                      Sign In
                    </Link>

                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className={buttonVariants({
                        className:
                          "min-h-11 rounded-xl bg-rose-500 text-white hover:bg-rose-600",
                      })}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
