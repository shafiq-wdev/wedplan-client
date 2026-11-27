import { NextResponse } from "next/server";

import { requireApiAccess } from "@/lib/auth-guards";
import { hasActivePremium } from "@/lib/plans";
import { createPremiumCheckout } from "@/lib/payments";

export async function POST(request) {
  const guard = await requireApiAccess(["vendor"]);
  if (guard.error) return guard.error;

  let body = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // The authenticated session is the only source of truth for the vendor.
  if (
    body?.vendorId &&
    String(body.vendorId) !== String(guard.session.user.id)
  ) {
    return NextResponse.json(
      { error: "You cannot start a subscription for another vendor." },
      { status: 403 }
    );
  }

  if (body?.plan && body.plan !== "premium") {
    return NextResponse.json(
      { error: "Only the Premium plan can be purchased." },
      { status: 400 }
    );
  }

  if (hasActivePremium(guard.session.user)) {
    return NextResponse.json(
      { error: "Your Premium subscription is already active." },
      { status: 409 }
    );
  }

  try {
    const result = await createPremiumCheckout(guard.session.user);

    return NextResponse.json({
      url: result.url,
      sessionId: result.sessionId,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("not configured")
        ? error.message
        : "Unable to start Stripe Checkout. Please try again.";

    return NextResponse.json(
      { error: message },
      { status: message.includes("not configured") ? 503 : 500 }
    );
  }
}
