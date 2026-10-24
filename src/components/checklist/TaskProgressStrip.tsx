"use client";

import { useEvent } from "@/hooks/useEvent";
import { Progress } from "@/components/ui";

/** Compact "4/22 done" bar, used where the full list will not fit. */
export function TaskProgressStrip() {
  const { state } = useEvent();
  const done = state.tasks.filter((t) => t.done).length;
  const percent = state.tasks.length ? (done / state.tasks.length) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <Progress value={percent} className="flex-1" label="Checklist progress" />
      <span className="num shrink-0 text-xs text-[var(--ink-muted)]">
        {done}/{state.tasks.length}
      </span>
    </div>
  );
}
