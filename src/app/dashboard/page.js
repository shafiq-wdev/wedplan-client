import { redirect } from "next/navigation";

import { requirePageAccess } from "@/lib/auth-guards";
import { getDashboardPath } from "@/lib/roles";

export const instant = false;

export default async function DashboardRedirectPage() {
  const session = await requirePageAccess();

  redirect(getDashboardPath(session.user.role));
}
