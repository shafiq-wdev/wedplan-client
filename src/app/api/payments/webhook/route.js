import { NextResponse } from "next/server";

import {
  getPaymentConfig,
  getStripe,
  isStripeWebhookConfigured,
  processStripeEvent,
} from "@/lib/payments";

export async function POST(request) {
  const { webhookSecret } = getPaymentConfig();
  const signature = request.headers.get("stripe-signature");

  if (!isStripeWebhookConfigured() || !signature) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 }
    );
  }

  let event;

  try {
    const payload = await request.text();
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    );
  }

  try {
    await processStripeEvent(event);
  } catch {
    return NextResponse.json(
      { error: "Webhook could not be processed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
