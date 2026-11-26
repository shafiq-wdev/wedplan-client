"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

export default function PasswordInput({
  id,
  name = "password",
  value,
  onChange,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  required = false,
  minLength,
  disabled = false,
  className,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-300" />

      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        disabled={disabled}
        className={cn(
          "h-12 rounded-xl border-rose-100 bg-rose-50/30 pl-11 pr-11 text-gray-900 placeholder:text-rose-200 focus-visible:border-rose-300 focus-visible:ring-rose-200",
          className
        )}
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-rose-300 transition hover:bg-rose-100 hover:text-rose-500"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
