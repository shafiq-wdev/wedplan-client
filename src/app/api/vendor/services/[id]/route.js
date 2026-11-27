import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { requireApiAccess } from "@/lib/auth-guards";
import { getVendorServiceFilter } from "@/lib/dashboard-data";
import { db } from "@/lib/db";
import {
  SERVICE_CATEGORIES,
  normalizeCategory,
  normalizeImages,
  serializeService,
} from "@/lib/services";

function parseId(value) {
  if (!ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

async function findOwnedService(objectId, user) {
  return db.collection("services").findOne({
    _id: objectId,
    ...getVendorServiceFilter(user),
  });
}

export async function PATCH(request, { params }) {
  const guard = await requireApiAccess(["vendor"]);
  if (guard.error) return guard.error;

  const { id } = await params;
  const objectId = parseId(id);

  if (!objectId) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  const owned = await findOwnedService(objectId, guard.session.user);

  if (!owned) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body?.status !== undefined) {
    return NextResponse.json(
      { error: "Only an admin can change service approval status." },
      { status: 403 }
    );
  }

  const updates = {};

  if (body?.title !== undefined) {
    const title = String(body.title).trim();

    if (title.length < 2) {
      return NextResponse.json(
        { error: "Service name is required." },
        { status: 400 }
      );
    }

    updates.title = title;
  }

  if (body?.description !== undefined) {
    const description = String(body.description).trim();

    if (description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters." },
        { status: 400 }
      );
    }

    updates.description = description;
  }

  if (body?.category !== undefined) {
    const category = normalizeCategory(body.category);

    if (!SERVICE_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Choose a valid service category." },
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

  if (body?.location !== undefined) {
    const location = String(body.location).trim();

    if (location.length < 2) {
      return NextResponse.json(
        { error: "Location is required." },
        { status: 400 }
      );
    }

    updates.location = location;
  }

  if (body?.images !== undefined || body?.image !== undefined) {
    const images = normalizeImages([
      ...(Array.isArray(body.images) ? body.images : []),
      body.image,
    ]);

    if (images.length === 0) {
      return NextResponse.json(
        { error: "Upload at least one service image." },
        { status: 400 }
      );
    }

    updates.images = images;
    updates.image = images[0];
  }

  if (body?.isAvailable !== undefined) {
    if (typeof body.isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "isAvailable must be a boolean." },
        { status: 400 }
      );
    }

    updates.isAvailable = body.isAvailable;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Provide at least one service field to update." },
      { status: 400 }
    );
  }

  updates.updatedAt = new Date();

  const updated = await db.collection("services").findOneAndUpdate(
    { _id: objectId },
    { $set: updates },
    { returnDocument: "after" }
  );

  if (!updated) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  return NextResponse.json({ service: serializeService(updated) });
}

export async function DELETE(request, { params }) {
  const guard = await requireApiAccess(["vendor"]);
  if (guard.error) return guard.error;

  const { id } = await params;
  const objectId = parseId(id);

  if (!objectId) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  const owned = await findOwnedService(objectId, guard.session.user);

  if (!owned) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  await db.collection("services").deleteOne({ _id: objectId });

  return NextResponse.json({ success: true });
}
