"use client";


/** The title block every page opens with. */
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
