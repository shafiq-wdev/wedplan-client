export const SIGNUP_ROLES = ["customer", "vendor", "admin"];

// Backwards-compatible alias.
export const PUBLIC_ROLES = SIGNUP_ROLES;

export const DASHBOARD_BY_ROLE = {
  admin: "/admin/dashboard",
  vendor: "/vendor/dashboard",
  customer: "/customer/dashboard",
};

export function getDashboardPath(role) {
  return DASHBOARD_BY_ROLE[role] ?? DASHBOARD_BY_ROLE.customer;
}

export function getRoleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "vendor") return "Vendor";
  return "Customer";
}

export function getSafeRedirectPath(value) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/\\")) return null;
  if (/[\u0000-\u001F\u007F]/.test(value)) return null;
  return value;
}
