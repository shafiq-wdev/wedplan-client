import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { adminApiGuard } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
  normalizeCategory,
  serializeService,
} from "@/lib/services";

function parseId(value) {
  if (!ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

export async function PATCH(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.error) return guard.error;

  const { id } = await params;
  const objectId = parseId(id);

  if (!objectId) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const updates = {};

  if (typeof body?.title === "string") {
    const title = body.title.trim();

    if (title.length < 2) {
      return NextResponse.json(
        { error: "Service title is required." },
        { status: 400 }
      );
    }

    updates.title = title;
  }

  if (typeof body?.description === "string") {
    updates.description = body.description.trim();
  }

  if (typeof body?.vendorName === "string") {
    updates.vendorName = body.vendorName.trim();
  }

  if (typeof body?.vendorTagline === "string") {
    updates.vendorTagline = body.vendorTagline.trim();
  }

  if (typeof body?.location === "string") {
    updates.location = body.location.trim();
  }

  if (typeof body?.image === "string") {
    const image = body.image.trim();

    if (image && !/^https?:\/\//i.test(image)) {
      return NextResponse.json(
        { error: "Image must be a valid http(s) URL." },
        { status: 400 }
      );
    }

    updates.image = image;
  }

  if (body?.category !== undefined) {
    const category = normalizeCategory(body.category);

    if (!SERVICE_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid service category." },
        { status: 400 }
      );
    }

    updates.category = category;
  }

  if (body?.price !== undefined) {
    const price = Number(body.price);

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number." },
        { status: 400 }
      );
    }

    updates.price = price;
  }

  if (body?.status !== undefined) {
    if (!SERVICE_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid service status." },
        { status: 400 }
      );
    }

    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 }
    );
  }

  updates.updatedAt = new Date();

  const result = await db
    .collection("services")
    .findOneAndUpdate({ _id: objectId }, { $set: updates }, {
      returnDocument: "after",
    });

  if (!result) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  return NextResponse.json({ service: serializeService(result) });
}

export async function DELETE(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.error) return guard.error;

  const { id } = await params;
  const objectId = parseId(id);

  if (!objectId) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  const deleted = await db.collection("services").deleteOne({ _id: objectId });

  if (!deleted.deletedCount) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
