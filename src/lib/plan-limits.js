import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getVendorServiceFilter } from "./dashboard-data";
import { db } from "./db";
import { getPlanLimitError, getVendorPlan } from "./plans";

export async function getPublishLimitError(vendorId, excludeId = null) {
  const id = String(vendorId ?? "").trim();

  if (!ObjectId.isValid(id)) return null;

  const vendor = await db.collection("user").findOne({ _id: new ObjectId(id) });

  if (!vendor || vendor.role !== "vendor" || getVendorPlan(vendor) !== "free") {
    return null;
  }

  const filter = {
    ...getVendorServiceFilter(vendor),
    status: "published",
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const activeCount = await db.collection("services").countDocuments(filter);
  const message = getPlanLimitError(vendor, activeCount);

  return message
    ? NextResponse.json({ error: message }, { status: 403 })
    : null;
}
