import { BriefcaseBusiness, CheckCircle2, HeartHandshake } from "lucide-react";
import { cn } from "cn";

const roles = [
  {
    value: "customer",
    label: "Customer",
    description: "I'm planning my wedding",
    icon: HeartHandshake,
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "I offer wedding services",
    icon: BriefcaseBusiness,
  },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {roles.map((role) => {
        const Icon = role.icon;
        const selected = value === role.value;

        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            aria-pressed={selected}
            className={cn(
              "group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
              selected
                ? "border-rose-300 bg-rose-50 shadow-sm shadow-rose-100 ring-2 ring-rose-200"
                : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50/40 hover:shadow-sm"
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                selected
                  ? "bg-rose-500 text-white"
                  : "bg-rose-100 text-rose-500 group-hover:bg-rose-200"
              )}
            >
              <Icon size={20} />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900">
                {role.label}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
                {role.description}
              </span>
            </span>

            {selected && (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 animate-fade-in text-rose-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
