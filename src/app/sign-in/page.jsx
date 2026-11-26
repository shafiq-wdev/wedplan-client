"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import AuthShell from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import PasswordInput from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/roles";

const initialForm = {
  email: "",
  password: "",
};

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (session?.user) {
      router.replace(getDashboardPath(session.user.role));
    }
  }, [session, router]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormError("");
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    try {
      setLoading(true);

      const { data, error } = await authClient.signIn.email({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: true,
      });

      if (error) {
        throw new Error(error.message || "Invalid email or password.");
      }

      const firstName = data?.user?.name?.split(" ")[0];

      toast.success(
        firstName ? `Welcome back, ${firstName}!` : "Welcome back!"
      );

      router.push(getDashboardPath(data?.user?.role));
      router.refresh();
    } catch (error) {
      console.error("Signin error:", error);

      const message =
        error.message || "Unable to sign in. Please check your credentials.";

      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setFormError("");

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/sign-in",
      });

      if (error) {
        throw new Error(error.message || "Google authentication failed.");
      }
    } catch (error) {
      console.error("Google signin error:", error);

      const message =
        error.message ||
        "Google authentication failed. Make sure Google credentials are configured.";

      setFormError(message);
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Welcome back to WedPlan"
      headline={
        <>
          Pick Up
          <br />
          Where You
          <br />
          <span className="text-rose-100">Left Off.</span>
        </>
      }
      description="Sign in to manage your wedding plans, connect with trusted vendors, and keep every detail in one place."
      features={[
        "Continue planning from any device",
        "Manage bookings and vendor conversations",
        "Secure email and Google authentication",
      ]}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
            <LogIn size={25} />
          </div>

          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </CardTitle>

          <CardDescription className="text-sm text-gray-500">
            Sign in to continue planning your perfect day.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div
                role="alert"
                className="flex animate-fade-in items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-300" />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 rounded-xl border-rose-100 bg-rose-50/30 pl-11 text-gray-900 placeholder:text-rose-200 focus-visible:border-rose-300 focus-visible:ring-rose-200"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="group h-12 w-full rounded-xl bg-rose-500 text-base font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5 hover:bg-rose-600 disabled:translate-y-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />

            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
              OR CONTINUE WITH
            </span>
          </div>

          <GoogleButton
            onClick={handleGoogleSignIn}
            loading={googleLoading}
            disabled={loading}
          />

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-rose-300" />
            Secure sign-in powered by Better Auth
          </p>

          <p className="mt-5 text-center text-sm text-gray-500">
            New to WedPlan?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-rose-500 transition hover:text-rose-600"
            >
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
