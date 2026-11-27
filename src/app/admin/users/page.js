import AdminShell from "@/components/admin/AdminShell";
import UsersManager from "@/components/admin/UsersManager";
import { requireAdminPage } from "@/lib/admin";
import { SIGNUP_ROLES } from "@/lib/roles";

export const instant = false;

export default async function AdminUsersPage({ searchParams }) {
  const session = await requireAdminPage();
  const params = (await searchParams) ?? {};
  const role = SIGNUP_ROLES.includes(params.role) ? params.role : "all";

  return (
    <AdminShell
      title="Registered users"
      description="Manage every registered account, switch roles between customer, vendor, and admin, and remove accounts that break the rules."
    >
      <UsersManager currentUserId={session.user.id} initialRole={role} />
    </AdminShell>
  );
}
