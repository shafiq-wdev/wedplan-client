import { randomUUID } from "node:crypto";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth-guards";

const COOKIE_NAME = "wedplan_jwt";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const error = new Error("JWT_SECRET is not configured on the client.");
    error.code = "JWT_NOT_CONFIGURED";
    throw error;
  }

  return secret;
}

export async function POST() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.isBlocked === true) {
    return NextResponse.json(
      { error: "This account is blocked." },
      { status: 403 }
    );
  }

  let secret;

  try {
    secret = getJwtSecret();
  } catch {
    return NextResponse.json(
      { error: "Secure backend auth is not configured. Please contact support." },
      { status: 503 }
    );
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "15m";
  const token = jwt.sign(
    {
      role: session.user.role || "customer",
      email: session.user.email || "",
      name: session.user.name || "",
      businessName: session.user.businessName || "",
      subscriptionPlan: session.user.subscriptionPlan || "free",
    },
    secret,
    {
      algorithm: "HS256",
      subject: String(session.user.id),
      issuer: "wedplan",
      audience: "wedplan-server",
      expiresIn,
      jwtid: randomUUID(),
    }
  );

  const decoded = jwt.decode(token);
  const maxAge =
    decoded && typeof decoded === "object" && decoded.exp && decoded.iat
      ? Math.max(60, decoded.exp - decoded.iat)
      : 900;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:
      process.env.BACKEND_TOKEN_COOKIE_SECURE === "true" ||
      process.env.NODE_ENV === "production",
    sameSite: process.env.BACKEND_TOKEN_COOKIE_SAME_SITE || "lax",
    path: "/",
    maxAge,
  });

  return NextResponse.json({ expiresAt: new Date(Date.now() + maxAge * 1000).toISOString() });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  return NextResponse.json({ success: true });
}
