"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Small status pill. Tone carries meaning, never colour alone. */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-[var(--line)] bg-[var(--surface-sunken)] text-[var(--ink-muted)]",
        primary: "border-[var(--primary)]/25 bg-[var(--primary-tint)] text-[var(--primary-deep)]",
        gold: "border-[var(--gold)]/40 bg-[var(--gold-tint)] text-[#7a5e1e]",
        success: "border-[var(--success)]/25 bg-[var(--success-tint)] text-[var(--success)]",
        warning: "border-[var(--warning)]/25 bg-[var(--warning-tint)] text-[var(--warning)]",
        danger: "border-[var(--danger)]/25 bg-[var(--danger-tint)] text-[var(--danger)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
