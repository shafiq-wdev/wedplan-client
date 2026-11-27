import { requireApiAccess, requirePageAccess } from "./auth-guards";

export async function getAdminSession() {
  const guard = await requireApiAccess(["admin"]);
  return guard.session ?? null;
}

export async function requireAdminPage() {
  return requirePageAccess(["admin"]);
}

export async function adminApiGuard() {
  return requireApiAccess(["admin"]);
}
