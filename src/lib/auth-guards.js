import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { auth } from "./auth";
import { getDashboardPath } from "./roles";

export async function getAuthSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export function isBlockedUser(user) {
  return user?.isBlocked === true;
}

export async function requirePageAccess(allowedRoles) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (isBlockedUser(session.user)) {
    redirect("/blocked");
  }

  const role = session.user.role || "customer";

  if (allowedRoles && !allowedRoles.includes(role)) {
    redirect(getDashboardPath(role));
  }

  return session;
}

export async function requireApiAccess(allowedRoles) {
  const session = await getAuthSession();

  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (isBlockedUser(session.user)) {
    return {
      error: NextResponse.json(
        { error: "This account is blocked." },
        { status: 403 }
      ),
    };
  }

  const role = session.user.role || "customer";

  if (allowedRoles && !allowedRoles.includes(role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}
