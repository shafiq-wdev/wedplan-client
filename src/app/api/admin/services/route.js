import { NextResponse } from "next/server";
import { adminApiGuard } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
  normalizeCategory,
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
  const image = String(body?.image ?? "").trim();
  const status = SERVICE_STATUSES.includes(body?.status)
    ? body.status
    : "pending";
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

  if (image && !/^https?:\/\//i.test(image)) {
    return NextResponse.json(
      { error: "Image must be a valid http(s) URL." },
      { status: 400 }
    );
  }

  const now = new Date();
  const document = {
    title,
    description,
    category,
    vendorName,
    vendorTagline,
    location,
    image,
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
