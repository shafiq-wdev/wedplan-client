import AdminShell from "@/components/admin/AdminShell";
import ServicesManager from "@/components/admin/ServicesManager";
import { requireAdminPage } from "@/lib/admin";

export const instant = false;

export default async function AdminServicesPage() {
  await requireAdminPage();

  return (
    <AdminShell
      title="Published services"
      description="Review every vendor listing, approve what goes live, and remove anything that does not meet platform standards."
    >
      <ServicesManager />
    </AdminShell>
  );
}
