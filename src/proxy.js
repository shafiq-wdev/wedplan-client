import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";

// Optimistic pre-check only. Role and blocked-user checks are enforced again
// server-side in src/lib/auth-guards.js and in every protected API route.
export function proxy(request) {
  const sessionCookie = getSessionCookie(request);

  if (sessionCookie) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/sign-in", request.url);
  const destination = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (destination.startsWith("/") && !destination.startsWith("//")) {
    signInUrl.searchParams.set("next", destination);
  }

  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customer/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/services/:id",
  ],
};
