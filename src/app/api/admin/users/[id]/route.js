import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { adminApiGuard } from "@/lib/admin";
import { db } from "@/lib/db";
import { SIGNUP_ROLES } from "@/lib/roles";

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
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  if (guard.session.user.id === id) {
    return NextResponse.json(
      { error: "You cannot change your own role or block yourself." },
      { status: 400 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const hasRole = body?.role !== undefined;
  const hasBlocked = body?.isBlocked !== undefined;

  if (!hasRole && !hasBlocked) {
    return NextResponse.json(
      { error: "Provide a role or isBlocked value." },
      { status: 400 }
    );
  }

  if (hasRole && !SIGNUP_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (hasBlocked && typeof body.isBlocked !== "boolean") {
    return NextResponse.json(
      { error: "isBlocked must be a boolean." },
      { status: 400 }
    );
  }

  const updates = { updatedAt: new Date() };

  if (hasRole) updates.role = body.role;
  if (hasBlocked) updates.isBlocked = body.isBlocked;

  const result = await db.collection("user").findOneAndUpdate(
    { _id: objectId },
    { $set: updates },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (body.isBlocked === true) {
    await db
      .collection("session")
      .deleteMany({ $or: [{ userId: objectId }, { userId: id }] });
  }

  return NextResponse.json({
    user: {
      id: result._id.toString(),
      name: result.name || "",
      email: result.email || "",
      role: result.role || "customer",
      isBlocked: Boolean(result.isBlocked),
    },
  });
}

export async function DELETE(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.error) return guard.error;

  const { id } = await params;
  const objectId = parseId(id);

  if (!objectId) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  if (guard.session.user.id === id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const deleted = await db.collection("user").deleteOne({ _id: objectId });

  if (!deleted.deletedCount) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await Promise.all([
    db
      .collection("session")
      .deleteMany({ $or: [{ userId: objectId }, { userId: id }] }),
    db
      .collection("account")
      .deleteMany({ $or: [{ userId: objectId }, { userId: id }] }),
  ]);

  return NextResponse.json({ success: true });
}
