import Stripe from "stripe";
import { ObjectId } from "mongodb";

import { db } from "./db.js";
import { VENDOR_PLANS } from "./plans.js";

const TRANSACTION_COLLECTION = "transactions";
const USER_COLLECTION = "user";

let stripeClient;
let stripeClientKey;

export function getPaymentConfig() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  return {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    priceId:
      process.env.STRIPE_PREMIUM_PRICE_ID ||
      process.env.STRIPE_PRICE_ID ||
      "",
    appUrl: appUrl.replace(/\/+$/, ""),
  };
}

export function isStripeCheckoutConfigured() {
  const { secretKey, priceId } = getPaymentConfig();
  return Boolean(secretKey && priceId);
}

export function isStripeWebhookConfigured() {
  const { secretKey, webhookSecret } = getPaymentConfig();
  return Boolean(secretKey && webhookSecret);
}

export function getStripe() {
  const { secretKey } = getPaymentConfig();

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient || stripeClientKey !== secretKey) {
    stripeClient = new Stripe(secretKey);
    stripeClientKey = secretKey;
  }

  return stripeClient;
}

function transactionCollection() {
  return db.collection(TRANSACTION_COLLECTION);
}

function userCollection() {
  return db.collection(USER_COLLECTION);
}

function toObjectId(value) {
  const id = String(value ?? "");
  if (!id || !ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

function userFilter(userId) {
  const id = String(userId ?? "");
  if (!id) return { _id: "__none__" };

  const conditions = [{ id }];
  const objectId = toObjectId(id);

  if (objectId) conditions.unshift({ _id: objectId });
  conditions.push({ _id: id });

  return { $or: conditions };
}

function amountFromCents(amountTotal) {
  const amount = Number(amountTotal);
  return Number.isFinite(amount) ? amount / 100 : 0;
}

function getSubscriptionId(value) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id || null;
}

function getInvoiceSubscriptionId(invoice) {
  return (
    getSubscriptionId(invoice?.subscription) ||
    getSubscriptionId(invoice?.parent?.subscription_details?.subscription) ||
    null
  );
}

export function getSubscriptionPeriodEnd(subscription) {
  const periodEnds = [Number(subscription?.current_period_end)]
    .concat(
      (subscription?.items?.data || []).map((item) =>
        Number(item?.current_period_end)
      )
    )
    .filter((value) => Number.isFinite(value) && value > 0);

  if (periodEnds.length === 0) return null;

  return new Date(Math.max(...periodEnds) * 1000);
}

export function serializeTransaction(transaction) {
  return {
    id: String(transaction?._id ?? ""),
    vendorId: transaction?.vendorId ? String(transaction.vendorId) : "",
    vendorName: transaction?.vendorName || "",
    customerName: transaction?.customerName || "",
    customerEmail: transaction?.customerEmail || "",
    plan: transaction?.plan || transaction?.subscriptionPlan || "premium",
    description: transaction?.description || "",
    amount: Number(transaction?.amount) || 0,
    currency: String(transaction?.currency || "usd").toUpperCase(),
    status: transaction?.status || "pending",
    paymentStatus: transaction?.paymentStatus || "",
    provider: transaction?.provider || "",
    providerStatus: transaction?.providerStatus || "",
    stripeSessionId: transaction?.stripeSessionId || "",
    stripeSubscriptionId: transaction?.stripeSubscriptionId || "",
    periodEnd: transaction?.periodEnd
      ? new Date(transaction.periodEnd).toISOString()
      : null,
    createdAt: transaction?.createdAt
      ? new Date(transaction.createdAt).toISOString()
      : null,
  };
}

export async function getTransactionBySessionId(sessionId) {
  if (!sessionId) return null;

  return transactionCollection().findOne({
    $or: [
      { stripeSessionId: String(sessionId) },
      { checkoutSessionId: String(sessionId) },
    ],
  });
}

async function findTransactionForCheckout(session) {
  const conditions = [];

  if (session?.id) conditions.push({ stripeSessionId: String(session.id) });

  const transactionId = toObjectId(session?.metadata?.transactionId);
  if (transactionId) conditions.push({ _id: transactionId });

  if (session?.client_reference_id) {
    conditions.push({
      vendorId: String(session.client_reference_id),
      plan: "premium",
      status: "pending",
    });
  }

  if (conditions.length === 0) return null;

  return transactionCollection().findOne({ $or: conditions });
}

async function findTransactionBySubscription(subscriptionId) {
  if (!subscriptionId) return null;

  return transactionCollection().findOne({
    stripeSubscriptionId: String(subscriptionId),
  });
}

async function markTransaction(transaction, updates, eventId) {
  if (!transaction?._id) return;

  const update = {
    $set: {
      ...updates,
      updatedAt: new Date(),
    },
  };

  if (eventId) {
    update.$set.lastWebhookEventId = eventId;
    update.$addToSet = { webhookEventIds: eventId };
  }

  await transactionCollection().updateOne({ _id: transaction._id }, update);
}

async function setVendorSubscription(userId, { planId, expiresAt }) {
  if (!userId) return;

  await userCollection().updateOne(
    userFilter(userId),
    {
      $set: {
        subscriptionPlan: planId,
        subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : null,
        updatedAt: new Date(),
      },
    }
  );
}

async function retrieveSubscription(subscriptionId) {
  if (!subscriptionId) return null;

  try {
    return await getStripe().subscriptions.retrieve(String(subscriptionId));
  } catch {
    return null;
  }
}

async function recordPendingTransaction(user, planId) {
  const now = new Date();
  const name =
    String(user?.name || user?.businessName || user?.email || "").trim() ||
    "Vendor";

  const transaction = {
    vendorId: String(user?.id || ""),
    vendorName: name,
    customerName: name,
    customerEmail: String(user?.email || ""),
    plan: planId,
    subscriptionPlan: planId,
    description: `${VENDOR_PLANS[planId]?.label || "Premium"} subscription`,
    amount: VENDOR_PLANS[planId]?.price || 0,
    currency: "usd",
    status: "pending",
    paymentStatus: "unpaid",
    provider: "stripe",
    providerStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const result = await transactionCollection().insertOne(transaction);

  return { ...transaction, _id: result.insertedId };
}

async function activatePremium({ transaction, subscription, session, event }) {
  const subscriptionId =
    getSubscriptionId(subscription) || getSubscriptionId(session?.subscription);
  const expiresAt = getSubscriptionPeriodEnd(subscription);

  await setVendorSubscription(transaction.vendorId, {
    planId: "premium",
    expiresAt,
  });

  await markTransaction(
    transaction,
    {
      status: "completed",
      paymentStatus: "paid",
      provider: "stripe",
      providerStatus: subscription?.status || "active",
      stripeSessionId: session?.id || transaction.stripeSessionId || null,
      stripeSubscriptionId: subscriptionId || transaction.stripeSubscriptionId || null,
      periodEnd: expiresAt,
      amount:
        session?.amount_total !== undefined
          ? amountFromCents(session.amount_total)
          : transaction.amount,
      currency: String(session?.currency || transaction.currency || "usd").toUpperCase(),
    },
    event?.id
  );
}

export async function createPremiumCheckout(user) {
  const { appUrl, priceId } = getPaymentConfig();

  if (!isStripeCheckoutConfigured()) {
    throw new Error("Stripe Checkout is not configured yet.");
  }

  const transaction = await recordPendingTransaction(user, "premium");

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user?.id ? String(user.id) : undefined,
      customer_email: user?.email ? String(user.email) : undefined,
      success_url: `${appUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payments/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        transactionId: String(transaction._id),
        vendorId: String(user?.id || ""),
        plan: "premium",
      },
      subscription_data: {
        metadata: {
          transactionId: String(transaction._id),
          vendorId: String(user?.id || ""),
          plan: "premium",
        },
      },
    });

    await transactionCollection().updateOne(
      { _id: transaction._id },
      {
        $set: {
          stripeSessionId: session.id,
          checkoutUrl: session.url,
          updatedAt: new Date(),
        },
      }
    );

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    await markTransaction(transaction, {
      status: "failed",
      paymentStatus: "unpaid",
      providerStatus: "checkout_failed",
    });

    throw error;
  }
}

export async function processStripeEvent(event) {
  const eventType = event?.type;
  const object = event?.data?.object;

  if (eventType === "checkout.session.completed") {
    if (object?.mode !== "subscription") return { handled: false };

    const transaction = await findTransactionForCheckout(object);
    if (!transaction) return { handled: false, reason: "transaction_not_found" };

    if (object.payment_status && object.payment_status !== "paid") {
      await markTransaction(
        transaction,
        {
          status: "pending",
          paymentStatus: object.payment_status,
          providerStatus: "incomplete",
          stripeSessionId: object.id,
        },
        event.id
      );
      return { handled: true };
    }

    const subscription = await retrieveSubscription(
      getSubscriptionId(object.subscription)
    );

    await activatePremium({
      transaction,
      subscription,
      session: object,
      event,
    });

    return { handled: true };
  }

  if (eventType === "checkout.session.expired") {
    const transaction = await findTransactionForCheckout(object);
    if (!transaction) return { handled: false, reason: "transaction_not_found" };

    await markTransaction(
      transaction,
      {
        status: "expired",
        paymentStatus: "unpaid",
        providerStatus: "expired",
        stripeSessionId: object?.id || transaction.stripeSessionId || null,
      },
      event.id
    );

    return { handled: true };
  }

  if (eventType === "invoice.payment_succeeded") {
    const subscriptionId = getInvoiceSubscriptionId(object);
    const transaction = await findTransactionBySubscription(subscriptionId);
    if (!transaction) return { handled: false, reason: "transaction_not_found" };

    const subscription = await retrieveSubscription(subscriptionId);

    await activatePremium({
      transaction,
      subscription,
      event,
    });

    return { handled: true };
  }

  if (eventType === "invoice.payment_failed") {
    const subscriptionId = getInvoiceSubscriptionId(object);
    const transaction = await findTransactionBySubscription(subscriptionId);
    if (!transaction) return { handled: false, reason: "transaction_not_found" };

    const subscription = await retrieveSubscription(subscriptionId);

    await markTransaction(
      transaction,
      {
        status: "failed",
        paymentStatus: "unpaid",
        providerStatus: subscription?.status || "past_due",
        periodEnd: getSubscriptionPeriodEnd(subscription) || null,
      },
      event.id
    );

    return { handled: true };
  }

  if (
    eventType === "customer.subscription.updated" ||
    eventType === "customer.subscription.deleted"
  ) {
    const subscriptionId = getSubscriptionId(object);
    const transaction = await findTransactionBySubscription(subscriptionId);
    if (!transaction) return { handled: false, reason: "transaction_not_found" };

    const status = String(object?.status || "");
    const isInactive =
      eventType === "customer.subscription.deleted" ||
      ["canceled", "unpaid", "incomplete", "incomplete_expired"].includes(status);

    if (isInactive) {
      await setVendorSubscription(transaction.vendorId, {
        planId: "free",
        expiresAt: null,
      });

      await markTransaction(
        transaction,
        {
          status: "cancelled",
          paymentStatus: "unpaid",
          providerStatus: status || "canceled",
          periodEnd: null,
          stripeSubscriptionId: subscriptionId || null,
        },
        event.id
      );

      return { handled: true };
    }

    if (["active", "trialing"].includes(status)) {
      const expiresAt = getSubscriptionPeriodEnd(object);

      await setVendorSubscription(transaction.vendorId, {
        planId: "premium",
        expiresAt,
      });

      await markTransaction(
        transaction,
        {
          status: "completed",
          paymentStatus: "paid",
          providerStatus: status,
          periodEnd: expiresAt,
          stripeSubscriptionId: subscriptionId || null,
        },
        event.id
      );
    }

    return { handled: true };
  }

  return { handled: false, reason: "event_not_supported" };
}
