"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/auth-client";
import { uploadImageToImgBB, validateImageFile } from "@/lib/image-upload";
import { getRoleLabel } from "@/lib/roles";
import { cn } from "cn";

function getInitials(name) {
  return String(name || "WedPlan user")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileForm({ user }) {
  const router = useRouter();
  const isVendor = user.role === "vendor";

  const [form, setForm] = useState({
    name: user.name || "",
    businessName: user.businessName || "",
  });
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [imageFile, setImageFile] = useState(null);
  const [objectUrl, setObjectUrl] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const preview = objectUrl || (removeImage ? "" : imageUrl);

  const updateField = (field, value) => {
    setFormError("");
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      validateImageFile(file);

      if (objectUrl) URL.revokeObjectURL(objectUrl);

      setImageFile(file);
      setObjectUrl(URL.createObjectURL(file));
      setRemoveImage(false);
      setFormError("");
    } catch (error) {
      toast.error(error.message || "Please choose a valid image.");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl("");
    setImageFile(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const businessName = form.businessName.trim();

    if (name.length < 2) {
      const message = "Please enter a name with at least 2 characters.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (isVendor && businessName.length < 2) {
      const message = "Please enter a business name with at least 2 characters.";
      setFormError(message);
      toast.error(message);
      return;
    }

    try {
      setBusy(true);

      let nextImageUrl = imageUrl;

      if (imageFile) {
        nextImageUrl = await uploadImageToImgBB(imageFile);
      } else if (removeImage) {
        nextImageUrl = "";
      }

      const payload = { name, image: nextImageUrl };

      if (isVendor) payload.businessName = businessName;

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to save your profile.");
      }

      const updated = data.user;

      setForm({
        name: updated.name || "",
        businessName: updated.businessName || "",
      });
      setImageUrl(updated.image || "");
      setImageFile(null);
      setRemoveImage(false);

      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setObjectUrl("");

      try {
        await getSession();
      } catch {
        // The next navigation will refresh the session anyway.
      }

      toast.success("Profile updated successfully.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save your profile. Please try again.";

      setFormError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-rose-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Edit profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update how your account appears across WedPlan.
          </p>
        </div>
        <span className="hidden rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 sm:inline-flex">
          {getRoleLabel(user.role)}
        </span>
      </div>

      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-rose-50 bg-rose-100 text-2xl font-bold text-rose-600 shadow-sm">
            {preview ? (
              <Image
                src={preview}
                alt={form.name || "Profile image"}
                width={112}
                height={112}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(form.name)
            )}
          </div>

          <Label
            htmlFor="profileImageInput"
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50",
              busy && "pointer-events-none opacity-60"
            )}
          >
            <UploadCloud className="h-4 w-4" />
            Choose image
          </Label>
          <Input
            id="profileImageInput"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            disabled={busy}
            className="hidden"
          />

          {preview ? (
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={busy}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-rose-600 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          ) : null}
        </div>

        <div className="grid flex-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profileName">Full name</Label>
            <Input
              id="profileName"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              maxLength={80}
              autoComplete="name"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileEmail">Email address</Label>
            <Input
              id="profileEmail"
              value={user.email || ""}
              readOnly
              className="bg-rose-50/40 text-slate-500"
            />
            <p className="text-xs text-slate-400">
              Email is kept secure and cannot be changed here.
            </p>
          </div>

          {isVendor ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="profileBusinessName">Business name</Label>
              <Input
                id="profileBusinessName"
                value={form.businessName}
                onChange={(event) =>
                  updateField("businessName", event.target.value)
                }
                maxLength={100}
                placeholder="Your wedding business name"
              />
              <p className="text-xs text-slate-400">
                This name is shown on your public service listings.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {formError ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {formError}
        </div>
      ) : null}

      <div className="mt-7 flex flex-col gap-4 border-t border-rose-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Role and subscription status are managed separately and cannot be
          changed from this page.
        </p>

        <Button
          type="submit"
          disabled={busy}
          className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
        >
          {busy ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {busy ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
