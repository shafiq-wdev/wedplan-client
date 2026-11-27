"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  ImagePlus,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import AuthShell from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordRules from "@/components/auth/PasswordRules";
import RoleSelector from "@/components/auth/RoleSelector";
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
import { uploadImageToImgBB } from "@/lib/image-upload";
import { getDashboardPath } from "@/lib/roles";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "customer",
  adminCode: "",
};

export default function SignUpPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (session?.user) {
      router.replace(getDashboardPath(session.user.role));
    }
  }, [session, router]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const passwordRules = {
    minLength: formData.password.length >= 6,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const updateField = (field, value) => {
    setFormError("");
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateField(name, value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));

    // Allow selecting the same file again after removing it.
    event.target.value = "";
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      const message = "Please enter your full name.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!isPasswordValid) {
      const message = "Please follow all password requirements.";
      setFormError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);

      const imageUrl = imageFile ? await uploadImageToImgBB(imageFile) : "";

      const { data, error } = await authClient.signUp.email({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        image: imageUrl || undefined,
        role: formData.role,
        adminCode: formData.adminCode.trim() || undefined,
      });

      if (error) {
        throw new Error(error.message || "Registration failed.");
      }

      toast.success("Account created successfully!");

      router.push(getDashboardPath(data?.user?.role ?? formData.role));
      router.refresh();
    } catch (error) {
      console.error("Signup error:", error);

      const message =
        error.message || "Something went wrong. Please try again.";

      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      setFormError("");

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        newUserCallbackURL: "/dashboard",
        errorCallbackURL: "/sign-up",
        additionalData: {
          role: formData.role,
          adminCode: formData.adminCode.trim() || undefined,
        },
      });

      if (error) {
        throw new Error(error.message || "Google authentication failed.");
      }
    } catch (error) {
      console.error("Google signup error:", error);

      const message =
        error.message ||
        "Google authentication failed. Make sure Google credentials are configured.";

      setFormError(message);
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  const isSubmitDisabled =
    loading ||
    googleLoading ||
    !isPasswordValid ||
    !formData.name.trim() ||
    !formData.email.trim();

  return (
    <AuthShell
      badge="Your dream wedding starts here"
      headline={
        <>
          Make Your
          <br />
          Special Day
          <br />
          <span className="text-rose-100">Unforgettable.</span>
        </>
      }
      description="Join WedPlan and discover everything you need to create beautiful wedding memories."
      features={[
        "Create a customer, vendor, or admin profile in seconds",
        "Secure email and Google authentication",
        "Save your plans and manage everything in one place",
      ]}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
            <UserRound size={25} />
          </div>

          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </CardTitle>

          <CardDescription className="text-sm text-gray-500">
            Join WedPlan and start planning your perfect day.
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
              <Label htmlFor="name">Full name</Label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-300" />

                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-12 rounded-xl border-rose-100 bg-rose-50/30 pl-11 text-gray-900 placeholder:text-rose-200 focus-visible:border-rose-300 focus-visible:ring-rose-200"
                  required
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

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
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={loading}
              />

              <PasswordRules rules={passwordRules} />
            </div>

            <div className="space-y-2">
              <Label>Account role</Label>

              <RoleSelector
                value={formData.role}
                onChange={(role) => updateField("role", role)}
              />

              {formData.role === "admin" && (
                <div className="animate-fade-in space-y-2 pt-1">
                  <Label htmlFor="adminCode">Admin access code</Label>

                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-300" />

                    <Input
                      id="adminCode"
                      name="adminCode"
                      type="password"
                      placeholder="Enter your admin access code"
                      value={formData.adminCode}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-rose-100 bg-rose-50/30 pl-11 text-gray-900 placeholder:text-rose-200 focus-visible:border-rose-300 focus-visible:ring-rose-200"
                      autoComplete="off"
                      disabled={loading}
                    />
                  </div>

                  <p className="text-xs leading-relaxed text-gray-400">
                    Only required when an admin access code is configured for
                    this site.
                  </p>
                </div>
              )}

              <p className="flex items-start gap-1.5 text-xs leading-relaxed text-gray-400">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
                Admins can manage registered users, vendors, published
                services, and platform transactions.
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Profile image
                <span className="ml-2 font-normal text-gray-400">
                  (Optional)
                </span>
              </Label>

              <label
                htmlFor="profileImage"
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-4 transition-all hover:-translate-y-0.5 hover:border-rose-400 hover:bg-rose-50/60"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-100 text-rose-500">
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Profile preview"
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera size={24} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-700">
                    {imageFile ? imageFile.name : "Upload your photo"}
                  </p>
                  <p className="text-xs text-gray-400">
                    JPG, PNG or WEBP. Max 5MB.
                  </p>
                </div>

                <ImagePlus
                  size={20}
                  className="shrink-0 text-rose-400 transition group-hover:scale-110"
                />

                <input
                  id="profileImage"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>

              {preview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-xs font-medium text-rose-500 hover:underline"
                >
                  Remove image
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="group h-12 w-full rounded-xl bg-rose-500 text-base font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5 hover:bg-rose-600 disabled:translate-y-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
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
            onClick={handleGoogleSignUp}
            loading={googleLoading}
            disabled={loading}
          />

          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-rose-500 transition hover:text-rose-600"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
