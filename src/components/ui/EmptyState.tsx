"use client";


/** Shown wherever a list can legitimately be empty. */
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
