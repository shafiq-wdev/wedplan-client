"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Ban,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import StatusBadge from "@/components/dashboard/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backendApi } from "@/lib/backend-auth";
import { uploadImageToImgBB } from "@/lib/image-upload";
import { SERVICE_CATEGORIES } from "@/lib/services";
import { cn } from "cn";

const emptyForm = {
  title: "",
  category: SERVICE_CATEGORIES[0],
  description: "",
  price: "",
  location: "",
  imageUrl: "",
};

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function VendorServicesManager({
  initialServices = [],
  plan = "free",
}) {
  const [services, setServices] = useState(initialServices);
  const activeCount = services.filter(
    (service) => service.status === "published"
  ).length;
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
    setImageFile(null);
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    setImageFile(null);
    setForm({
      title: service.title,
      category: service.category,
      description: service.description,
      price: String(service.price),
      location: service.location,
      imageUrl: service.image,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    setImageFile(file);
    event.target.value = "";
  };

  const submitService = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = form.imageUrl;

      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImageToImgBB(imageFile);
        updateField("imageUrl", imageUrl);
      }

      if (!imageUrl) {
        throw new Error("Upload a service image before saving.");
      }

      const payload = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        price: Number(form.price),
        location: form.location.trim(),
        images: [imageUrl],
      };

      const data = await backendApi(
        editingId ? `/api/vendor/services/${editingId}` : "/api/vendor/services",
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        }
      );

      setServices((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? data.service : item))
          : [data.service, ...current]
      );

      toast.success(
        editingId
          ? "Service updated. Approval status was kept."
          : "Service submitted for admin approval."
      );
      resetForm();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (service) => {
    setBusyId(service.id);

    try {
      const data = await backendApi(`/api/vendor/services/${service.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: !service.isAvailable }),
      });

      setServices((current) =>
        current.map((item) =>
          item.id === service.id ? data.service : item
        )
      );
      toast.success(
        data.service.isAvailable
          ? "Service is now accepting bookings."
          : "Service is no longer accepting bookings."
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  };

  const deleteService = async (service) => {
    const confirmed = window.confirm(
      `Delete "${service.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusyId(service.id);

    try {
      await backendApi(`/api/vendor/services/${service.id}`, {
        method: "DELETE",
      });

      setServices((current) => current.filter((item) => item.id !== service.id));
      toast.success("Service deleted.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={submitService}
        className="h-fit space-y-4 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">
              {editingId ? "Edit service" : "Add a service"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              New listings start as pending until an admin approves them.
            </p>
          </div>

          {editingId ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="rounded-lg"
            >
              Cancel
            </Button>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendorServiceTitle">Service name</Label>
          <Input
            id="vendorServiceTitle"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Golden hour wedding photography"
            required
            minLength={2}
            className="h-10 rounded-xl border-rose-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendorServiceCategory">Category</Label>
          <select
            id="vendorServiceCategory"
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="h-10 w-full rounded-xl border border-rose-100 bg-white px-3 text-sm text-slate-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            {SERVICE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="vendorServicePrice">Price</Label>
            <Input
              id="vendorServicePrice"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="1200"
              required
              className="h-10 rounded-xl border-rose-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorServiceLocation">Location</Label>
            <Input
              id="vendorServiceLocation"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="City, country"
              required
              minLength={2}
              className="h-10 rounded-xl border-rose-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendorServiceDescription">Description</Label>
          <textarea
            id="vendorServiceDescription"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={4}
            required
            minLength={10}
            placeholder="Describe what is included in this package..."
            className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendorServiceImage">Service image</Label>
          <label
            htmlFor="vendorServiceImage"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-rose-200 bg-rose-50/50 px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            <ImagePlus className="h-4 w-4" />
            {imageFile ? imageFile.name : "Choose an image file"}
          </label>
          <input
            id="vendorServiceImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="sr-only"
          />
          {!editingId ? (
            <p className="text-xs text-slate-400">
              Images are uploaded to ImgBB. Maximum 5 MB.
            </p>
          ) : null}
        </div>

        {form.imageUrl ? (
          <div className="relative h-28 overflow-hidden rounded-xl border border-rose-100">
            <Image
              src={form.imageUrl}
              alt="Service preview"
              fill
              sizes="320px"
              unoptimized
              className="object-cover"
            />
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={submitting || uploading}
          className="h-11 w-full rounded-xl bg-rose-500 hover:bg-rose-600"
        >
          {submitting || uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : editingId ? (
            <Pencil className="mr-2 h-4 w-4" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {uploading ? "Uploading image..." : editingId ? "Save changes" : "Submit service"}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="font-semibold text-slate-900">Your services</p>
            <p className="mt-1 text-xs text-slate-500">
              {services.length} submitted · {activeCount} active on the{" "}
              {plan} plan
            </p>
          </div>

          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
            {plan === "premium" ? "Unlimited listings" : "3 active listings"}
          </span>
        </div>

        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center">
            <ImagePlus className="mx-auto h-8 w-8 text-rose-300" />
            <h3 className="mt-3 font-semibold text-slate-900">
              No services submitted yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add your first package using the form.
            </p>
          </div>
        ) : (
          services.map((service) => {
            const busy = busyId === service.id;

            return (
              <article
                key={service.id}
                className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-rose-50 sm:w-36">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        sizes="144px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-rose-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {service.title}
                      </h3>
                      <StatusBadge status={service.status} />
                      <StatusBadge
                        status={
                          service.isAvailable ? "available" : "unavailable"
                        }
                      >
                        {service.isAvailable ? "Available" : "Paused"}
                      </StatusBadge>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {service.category} · {service.location} ·{" "}
                      {formatPrice(service.price)}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {service.description}
                    </p>

                    {service.status === "rejected" ? (
                      <p className="mt-2 text-xs font-medium text-rose-500">
                        Rejected services are hidden from customers.
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.status === "published" ? (
                        <Link
                          href={`/services/${service.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "rounded-lg"
                          )}
                        >
                          View
                        </Link>
                      ) : null}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(service)}
                        disabled={busy}
                        className="rounded-lg"
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAvailability(service)}
                        disabled={busy}
                        className="rounded-lg"
                      >
                        {service.isAvailable ? (
                          <Ban className="mr-1 h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                        )}
                        {service.isAvailable ? "Pause" : "Resume"}
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteService(service)}
                        disabled={busy}
                        className="rounded-lg"
                      >
                        {busy ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
