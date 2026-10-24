"use client";

import { cn } from "@/lib/utils";
import type { TaskFilter } from "./filters";
import { TASK_FILTERS } from "./filters";

/** The All / Pending / Completed / Overdue toggles above the list. */
export function TaskFilterBar({
  value,
  onChange,
  counts,
}: {
  value: TaskFilter;
  onChange: (f: TaskFilter) => void;
  counts: Record<TaskFilter, number>;
}) {
  return (
    <div role="group" aria-label="Filter tasks" className="flex flex-wrap gap-1.5">
      {TASK_FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={value === f}
          onClick={() => onChange(f)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            value === f
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)]",
          )}
        >
          {f}
          <span className={cn("num ml-1.5", value === f ? "text-white/70" : "text-[var(--ink-faint)]")}>
            {counts[f]}
          </span>
        </button>
      ))}
    </div>
  );
}
