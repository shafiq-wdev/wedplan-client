"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Loader2,
  Plus,
  Store,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
} from "@/lib/services";
import { cn } from "cn";

const statusStyles = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
};

const emptyForm = {
  title: "",
  vendorName: "",
  vendorTagline: "",
  location: "",
  images: "",
  vendorId: "",
  category: SERVICE_CATEGORIES[0],
  price: "",
  description: "",
  status: "pending",
};

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const response = await fetch("/api/admin/services", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!active) return;

        if (!response.ok) {
          throw new Error(data.error || "Unable to load services.");
        }

        setServices(data.services ?? []);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const createService = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price || 0),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create service.");
      }

      setServices((current) => [data.service, ...current]);
      setForm(emptyForm);
      toast.success("Service created.");
    } catch (createError) {
      toast.error(createError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const setStatus = async (service, status) => {
    setBusyId(service.id);

    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update service.");
      }

      setServices((current) =>
        current.map((item) =>
          item.id === service.id ? data.service : item
        )
      );

      toast.success(`Service marked ${status}.`);
    } catch (updateError) {
      toast.error(updateError.message);
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
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete service.");
      }

      setServices((current) =>
        current.filter((item) => item.id !== service.id)
      );
      toast.success("Service deleted.");
    } catch (deleteError) {
      toast.error(deleteError.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={createService}
        className="h-fit space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div>
          <h2 className="font-semibold text-slate-900">Add a service</h2>
          <p className="mt-1 text-xs text-slate-500">
            Create a listing, then publish it so couples can discover it.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceTitle">Title</Label>
          <Input
            id="serviceTitle"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Golden hour wedding photography"
            required
            minLength={2}
            className="h-10 rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceVendor">Vendor</Label>
          <Input
            id="serviceVendor"
            value={form.vendorName}
            onChange={(event) => updateField("vendorName", event.target.value)}
            placeholder="Vendor or studio name"
            className="h-10 rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceTagline">Vendor tagline</Label>
          <Input
            id="serviceTagline"
            value={form.vendorTagline}
            onChange={(event) =>
              updateField("vendorTagline", event.target.value)
            }
            placeholder="Award-winning wedding studio"
            className="h-10 rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceLocation">Location</Label>
          <Input
            id="serviceLocation"
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="City, country"
            className="h-10 rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceImages">Image URLs (one per line)</Label>
          <textarea
            id="serviceImages"
            value={form.images}
            onChange={(event) => updateField("images", event.target.value)}
            rows={3}
            placeholder={"https://images.example.com/one.jpg\nhttps://images.example.com/two.jpg"}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceVendorId">Vendor ID (optional)</Label>
          <Input
            id="serviceVendorId"
            value={form.vendorId}
            onChange={(event) => updateField("vendorId", event.target.value)}
            placeholder="Vendor account ID that owns this service"
            className="h-10 rounded-xl border-slate-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="serviceCategory">Category</Label>
            <select
              id="serviceCategory"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700"
            >
              {SERVICE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servicePrice">Price (USD)</Label>
            <Input
              id="servicePrice"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="0"
              className="h-10 rounded-xl border-slate-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceDescription">Description</Label>
          <textarea
            id="serviceDescription"
            value={form.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            rows={3}
            placeholder="What is included in this service?"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceStatus">Status</Label>
          <select
            id="serviceStatus"
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm capitalize text-slate-700"
          >
            {SERVICE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-10 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create service
            </>
          )}
        </Button>
      </form>

      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                      <p className="mt-2 text-sm text-slate-500">
                        Loading services...
                      </p>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <Store className="mx-auto h-6 w-6 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">
                        No services yet. Create the first listing.
                      </p>
                    </td>
                  </tr>
                ) : (
                  services.map((service) => {
                    const isBusy = busyId === service.id;

                    return (
                      <tr key={service.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                              {service.image ? (
                                <Image
                                  src={service.image}
                                  alt={service.title}
                                  fill
                                  unoptimized
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-slate-300">
                                  <Store className="h-4 w-4" />
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">
                                {service.title}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {service.vendorName || "Unassigned"} ·{" "}
                                {service.category}
                              </p>
                              <p className="truncate text-xs text-slate-400">
                                {service.location || "No location set"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          ${Number(service.price).toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
                              statusStyles[service.status] ||
                                statusStyles.pending
                            )}
                          >
                            {service.status}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {service.status !== "published" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setStatus(service, "published")
                                }
                                disabled={isBusy}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-40"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Publish
                              </button>
                            )}

                            {service.status === "published" && (
                              <button
                                type="button"
                                onClick={() => setStatus(service, "pending")}
                                disabled={isBusy}
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                              >
                                Unpublish
                              </button>
                            )}

                            {service.status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setStatus(service, "rejected")
                                }
                                disabled={isBusy}
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-40"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteService(service)}
                              disabled={isBusy}
                              aria-label={`Delete ${service.title}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                            >
                              {isBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Published services appear on the public services page. Use Publish,
          Unpublish, or Reject to control what couples can see.
        </p>
      </div>
    </div>
  );
}
