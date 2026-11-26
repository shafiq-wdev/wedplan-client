export const PUBLIC_ROLES = ["customer", "vendor"];

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
