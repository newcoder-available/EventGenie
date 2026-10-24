"use client";

import { cn } from "@/lib/utils";

/** Labelled progress bar with an accessible value. */
export function Progress({
  value,
  tone = "primary",
  className,
  label,
}: {
  value: number;
  tone?: "primary" | "gold" | "success" | "danger";
  className?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const colour = {
    primary: "var(--primary)",
    gold: "var(--gold)",
    success: "var(--success)",
    danger: "var(--danger)",
  }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]", className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${clamped}%`, background: colour }}
      />
    </div>
  );
}
