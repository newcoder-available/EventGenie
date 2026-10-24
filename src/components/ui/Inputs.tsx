"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Text, textarea and select inputs, plus the Field wrapper that labels them. */
export const inputClass =
  "w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none transition-colors focus:border-[var(--primary)] disabled:opacity-60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputClass, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(inputClass, "min-h-20 resize-y", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(inputClass, "cursor-pointer pr-8", className)} {...props} />
));
Select.displayName = "Select";

export function Field({
  label,
  error,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="eg-label mb-1.5 block">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[var(--ink-faint)]">{hint}</p>
      ) : null}
    </div>
  );
}
