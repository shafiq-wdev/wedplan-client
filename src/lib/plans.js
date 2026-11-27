export const VENDOR_PLANS = {
  free: {
    id: "free",
    label: "Free",
    maxActiveServices: 3,
    price: 0,
    features: [
      "Up to 3 active services",
      "Basic vendor dashboard",
      "Booking request management",
    ],
  },
  premium: {
    id: "premium",
    label: "Premium",
    maxActiveServices: null,
    price: 29,
    features: [
      "Unlimited active services",
      "Premium vendor badge",
      "All Free plan features",
    ],
  },
};

export const FREE_PLAN_SERVICE_LIMIT = VENDOR_PLANS.free.maxActiveServices;

export function hasActivePremium(user, now = new Date()) {
  if (user?.subscriptionPlan !== "premium") return false;

  const expiresAt = user.subscriptionExpiresAt;
  if (!expiresAt) return true;

  const expiresAtTime = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiresAtTime)) return true;

  return expiresAtTime > now.getTime();
}

export function getVendorPlan(user) {
  return hasActivePremium(user) ? "premium" : "free";
}

export function getVendorPlanDetails(user) {
  return VENDOR_PLANS[getVendorPlan(user)];
}

export function canPublishMoreServices(user, activeServiceCount) {
  const plan = getVendorPlanDetails(user);

  if (plan.maxActiveServices === null) return true;

  return Number(activeServiceCount) < plan.maxActiveServices;
}

export function getPlanLimitError(user, activeServiceCount) {
  if (canPublishMoreServices(user, activeServiceCount)) return null;

  return "Free vendors can have up to 3 active services. Upgrade to Premium to add more.";
}
