import AdminShell from "@/components/admin/AdminShell";
import ServicesManager from "@/components/admin/ServicesManager";
import { requireAdminPage } from "@/lib/admin";

export const instant = false;

export default async function AdminServicesPage() {
  await requireAdminPage();

  return (
    <AdminShell
      title="Manage services"
      description="Search and filter every submitted listing, review pending services, change statuses, and remove inappropriate services."
    >
      <ServicesManager />
    </AdminShell>
  );
}
