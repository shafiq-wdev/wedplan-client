"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Ban, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function BlockedPage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);

      const { error } = await authClient.signOut();

      if (error) {
        throw new Error(error.message || "Unable to sign out.");
      }

      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <AuthShell
      badge="WedPlan account notice"
      headline={
        <>
          Access
          <br />
          Temporarily
          <br />
          <span className="text-rose-100">Restricted.</span>
        </>
      }
      description="This account is blocked from protected WedPlan features. Contact your administrator if you think this is a mistake."
      features={[
        "Dashboards and bookings are unavailable",
        "Existing account data remains safe",
        "Sign out to switch to another account",
      ]}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
            <Ban size={25} />
          </div>

          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Account blocked
          </CardTitle>

          <CardDescription className="text-sm text-gray-500">
            You cannot access dashboards, bookings, or other protected areas
            while this account is blocked.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-0">
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
          >
            Please contact a WedPlan administrator to restore access to this
            account.
          </div>

          <Button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="group h-12 w-full rounded-xl bg-rose-500 text-base font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5 hover:bg-rose-600 disabled:translate-y-0 disabled:opacity-50"
          >
            {signingOut ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-5 w-5" />
                Sign out
              </>
            )}
          </Button>

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-rose-500 transition hover:text-rose-600"
          >
            Return to home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
