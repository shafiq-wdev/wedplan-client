import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "cn";

const ruleDefinitions = [
  { key: "minLength", label: "6+ characters" },
  { key: "uppercase", label: "Uppercase letter" },
  { key: "lowercase", label: "Lowercase letter" },
];

export default function PasswordRules({ rules }) {
  const passed = ruleDefinitions.filter((rule) => rules[rule.key]).length;
  const percent = (passed / ruleDefinitions.length) * 100;
  const barColor =
    passed === 3
      ? "bg-emerald-500"
      : passed === 2
        ? "bg-amber-400"
        : "bg-rose-400";

  return (
    <div className="space-y-2 pt-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-rose-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            barColor
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-3">
        {ruleDefinitions.map((rule) => {
          const valid = rules[rule.key];

          return (
            <div
              key={rule.key}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                valid ? "text-emerald-600" : "text-gray-400"
              )}
            >
              {valid ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {rule.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
