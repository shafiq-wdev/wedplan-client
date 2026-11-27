import DashboardShell from "@/components/dashboard/DashboardShell";

export default function AdminShell({
  title,
  description,
  actions,
  children,
}) {
  return (
    <DashboardShell
      role="admin"
      title={title}
      description={description}
      actions={actions}
      badge="Administrator access"
    >
      {children}
    </DashboardShell>
  );
}
