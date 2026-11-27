import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { requireApiAccess } from "@/lib/auth-guards";
import { db } from "@/lib/db";

const PROTECTED_FIELDS = [
  "id",
  "_id",
  "email",
  "role",
  "isBlocked",
  "subscriptionPlan",
  "subscriptionExpiresAt",
];

function userFilter(userId) {
  const id = String(userId ?? "");
  if (!id) return { _id: "__none__" };

  const conditions = [{ id }];
  const objectId = ObjectId.isValid(id) ? new ObjectId(id) : null;

  if (objectId) conditions.unshift({ _id: objectId });
  conditions.push({ _id: id });

  return { $or: conditions };
}

function readName(value) {
  if (typeof value !== "string") return null;

  const name = value.trim();
  if (name.length < 2 || name.length > 80) return null;

  return name;
}

function readImage(value) {
  if (typeof value !== "string") return null;

  const image = value.trim();
  if (!image) return "";
  if (image.length > 2000) return null;

  try {
    const url = new URL(image);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return image;
  } catch {
    return null;
  }
}

function readBusinessName(value) {
  if (typeof value !== "string") return null;

  const businessName = value.trim();
  if (businessName.length > 100) return null;

  return businessName;
}

export async function PATCH(request) {
  const guard = await requireApiAccess();
  if (guard.error) return guard.error;

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (PROTECTED_FIELDS.some((field) => field in body)) {
    return NextResponse.json(
      {
        error:
          "Role, email, and subscription fields cannot be changed from profile settings.",
      },
      { status: 400 }
    );
  }

  const { user } = guard.session;
  const updates = {};

  if ("name" in body) {
    const name = readName(body.name);

    if (!name) {
      return NextResponse.json(
        { error: "Name must be between 2 and 80 characters." },
        { status: 400 }
      );
    }

    updates.name = name;
  }

  if ("image" in body) {
    const image = readImage(body.image);

    if (image === null) {
      return NextResponse.json(
        { error: "Profile image must be a valid http(s) URL." },
        { status: 400 }
      );
    }

    updates.image = image;
  }

  if ("businessName" in body) {
    if (user.role !== "vendor") {
      return NextResponse.json(
        { error: "Business name can only be updated by vendors." },
        { status: 403 }
      );
    }

    const businessName = readBusinessName(body.businessName);

    if (businessName === null) {
      return NextResponse.json(
        { error: "Business name must be 100 characters or fewer." },
        { status: 400 }
      );
    }

    updates.businessName = businessName;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Provide at least one profile field to update." },
      { status: 400 }
    );
  }

  try {
    const updated = await db.collection("user").findOneAndUpdate(
      userFilter(user.id),
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: updated._id.toString(),
        name: updated.name || "",
        email: updated.email || "",
        image: updated.image || "",
        role: updated.role || "customer",
        businessName: updated.businessName || "",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to save your profile. Please try again." },
      { status: 500 }
    );
  }
}
