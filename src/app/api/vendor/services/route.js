import { NextResponse } from "next/server";

import { requireApiAccess } from "@/lib/auth-guards";
import { getVendorServiceFilter } from "@/lib/dashboard-data";
import { db } from "@/lib/db";
import { getPlanLimitError } from "@/lib/plans";
import {
  SERVICE_CATEGORIES,
  normalizeCategory,
  normalizeImages,
  serializeService,
} from "@/lib/services";

export async function GET() {
  const guard = await requireApiAccess(["vendor"]);
  if (guard.error) return guard.error;

  const services = await db
    .collection("services")
    .find(getVendorServiceFilter(guard.session.user))
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return NextResponse.json({ services: services.map(serializeService) });
}

export async function POST(request) {
  const guard = await requireApiAccess(["vendor"]);
  if (guard.error) return guard.error;

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const category = normalizeCategory(body?.category);
  const location = String(body?.location ?? "").trim();
  const price = Number(body?.price);
  const images = normalizeImages([
    ...(Array.isArray(body?.images) ? body.images : [body?.image]),
  ]);

  if (title.length < 2) {
    return NextResponse.json(
      { error: "Service name is required." },
      { status: 400 }
    );
  }

  if (!SERVICE_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Choose a valid service category." },
      { status: 400 }
    );
  }

  if (description.length < 10) {
    return NextResponse.json(
      { error: "Description must be at least 10 characters." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "Price must be a positive number." },
      { status: 400 }
    );
  }

  if (location.length < 2) {
    return NextResponse.json(
      { error: "Location is required." },
      { status: 400 }
    );
  }

  if (images.length === 0) {
    return NextResponse.json(
      { error: "Upload at least one service image." },
      { status: 400 }
    );
  }

  const activeCount = await db.collection("services").countDocuments({
    ...getVendorServiceFilter(guard.session.user),
    status: "published",
  });

  const limitError = getPlanLimitError(guard.session.user, activeCount);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 403 });
  }

  const now = new Date();
  const document = {
    title,
    description,
    category,
    price,
    location,
    image: images[0],
    images,
    vendorId: String(guard.session.user.id),
    vendorName: String(guard.session.user.name ?? ""),
    vendorTagline: String(guard.session.user.businessTagline ?? ""),
    status: "pending",
    isAvailable: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("services").insertOne(document);

  return NextResponse.json(
    { service: serializeService({ ...document, _id: result.insertedId }) },
    { status: 201 }
  );
}
