"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * shadcn-style primitives: Radix for behaviour and accessibility, CVA for
 * variants, our own tokens for colour. Written against the design system in
 * globals.css rather than generated, so there is one source of truth for the
 * palette and no competing config.
 */

/* -------------------------------- Button ------------------------------- */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-deep)]",
        secondary:
          "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-sunken)]",
        ghost: "text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)]",
        gold: "bg-[var(--gold-tint)] text-[var(--primary-deep)] border border-[var(--gold)] hover:bg-[var(--gold)] hover:text-white",
        danger: "bg-[var(--danger)] text-white hover:opacity-90",
        quiet: "text-[var(--primary)] hover:bg-[var(--primary-tint)]",
      },
      size: {
        sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
        md: "h-10 px-4 [&_svg]:size-4",
        lg: "h-11 px-5 [&_svg]:size-4",
        icon: "h-9 w-9 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

/* --------------------------------- Card -------------------------------- */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("eg-card", className)} {...props} />;
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-tint)] text-[var(--primary)]">
            <Icon className="h-[1.1rem] w-[1.1rem]" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-lg leading-snug text-[var(--ink)]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

/* -------------------------------- Badge -------------------------------- */

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

/* ------------------------------- Progress ------------------------------ */

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

/* -------------------------------- Inputs ------------------------------- */

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

/* -------------------------------- Dialog ------------------------------- */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-[#29242a]/35 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in" />
      <DialogPrimitive.Content
        className={cn(
          "eg-scroll fixed left-1/2 top-1/2 z-[71] max-h-[90dvh] w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)] sm:p-6",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <DialogPrimitive.Title className="font-display text-xl text-[var(--ink)]">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm text-[var(--ink-muted)]">
                {description}
              </DialogPrimitive.Description>
            ) : (
              // Radix warns without one; keep it for screen readers.
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Close"
            className="rounded-lg p-1.5 text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/* ------------------------------ Empty state ----------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line-strong)] px-6 py-12 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-[var(--ink-faint)]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-display text-base text-[var(--ink)]">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-[var(--ink-muted)]">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* -------------------------------- Skeleton ------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("eg-skeleton", className)} />;
}

/* ------------------------------ Section head ---------------------------- */

export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-[var(--ink)] sm:text-[1.75rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--ink-muted)]">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
