"use client";

import { cn } from "@/lib/utils";

/** Surface container, and the header row most panels start with. */
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
