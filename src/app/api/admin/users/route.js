import { NextResponse } from "next/server";
import { adminApiGuard } from "@/lib/admin";
import { db } from "@/lib/db";
import { SIGNUP_ROLES } from "@/lib/roles";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  const guard = await adminApiGuard();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const query = searchParams.get("q")?.trim();

  const filter = {};

  if (role && SIGNUP_ROLES.includes(role)) {
    filter.role = role;
  }

  if (query) {
    const regex = new RegExp(escapeRegex(query), "i");
    filter.$or = [{ name: regex }, { email: regex }, { businessName: regex }];
  }

  const users = await db
    .collection("user")
    .find(filter, {
      projection: {
        name: 1,
        email: 1,
        role: 1,
        isBlocked: 1,
        image: 1,
        emailVerified: 1,
        businessName: 1,
        subscriptionPlan: 1,
        subscriptionExpiresAt: 1,
        createdAt: 1,
      },
    })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return NextResponse.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      name: user.name || "",
      email: user.email || "",
      role: user.role || "customer",
      isBlocked: Boolean(user.isBlocked),
      image: user.image || "",
      emailVerified: Boolean(user.emailVerified),
      businessName: user.businessName || "",
      subscriptionPlan: user.subscriptionPlan || "free",
      subscriptionExpiresAt: user.subscriptionExpiresAt
        ? new Date(user.subscriptionExpiresAt).toISOString()
        : null,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    })),
  });
}
