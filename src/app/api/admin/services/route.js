import { NextResponse } from "next/server";
import { adminApiGuard } from "@/lib/admin";
import { db } from "@/lib/db";
import { getPublishLimitError } from "@/lib/plan-limits";
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
  normalizeCategory,
  normalizeImages,
  serializeService,
} from "@/lib/services";

export async function GET() {
  const guard = await adminApiGuard();
  if (guard.error) return guard.error;

  const services = await db
    .collection("services")
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return NextResponse.json({ services: services.map(serializeService) });
}

export async function POST(request) {
  const guard = await adminApiGuard();
  if (guard.error) return guard.error;

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const category = SERVICE_CATEGORIES.includes(body?.category)
    ? body.category
    : normalizeCategory(body?.category);
  const vendorName = String(body?.vendorName ?? "").trim();
  const vendorTagline = String(body?.vendorTagline ?? "").trim();
  const location = String(body?.location ?? "").trim();
  const images = normalizeImages([
    ...(Array.isArray(body?.images) ? body.images : []),
    body?.image,
  ]);
  const status = SERVICE_STATUSES.includes(body?.status)
    ? body.status
    : "pending";
  const vendorId = String(body?.vendorId ?? "").trim();
  const price = Number(body?.price ?? 0);

  if (title.length < 2) {
    return NextResponse.json(
      { error: "Service title is required." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "Price must be a positive number." },
      { status: 400 }
    );
  }

  if (body?.image && images.length === 0) {
    return NextResponse.json(
      { error: "Image must be a valid http(s) URL." },
      { status: 400 }
    );
  }

  if (status === "published") {
    const limitError = await getPublishLimitError(vendorId);

    if (limitError) return limitError;
  }

  const now = new Date();
  const document = {
    title,
    description,
    category,
    vendorName,
    vendorTagline,
    location,
    image: images[0] || "",
    images,
    vendorId,
    price,
    status,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("services").insertOne(document);

  return NextResponse.json(
    { service: serializeService({ ...document, _id: result.insertedId }) },
    { status: 201 }
  );
}
