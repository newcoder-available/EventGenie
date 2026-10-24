"use client";

import { Check, CircleDot, TriangleAlert } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { formatDate, milestoneDate, milestoneStatus, type MilestoneStatus } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

const STATUS_META: Record<
  MilestoneStatus,
  { label: string; tone: "success" | "danger" | "gold" | "neutral"; dot: string }
> = {
  done: { label: "Done", tone: "success", dot: "var(--success)" },
  overdue: { label: "Overdue", tone: "danger", dot: "var(--danger)" },
  active: { label: "Now", tone: "gold", dot: "var(--gold)" },
  upcoming: { label: "Upcoming", tone: "neutral", dot: "var(--line-strong)" },
};

function monthsLabel(monthsBefore: number): string {
  if (monthsBefore === 0) return "On the day";
  if (monthsBefore < 1) return `${Math.round(monthsBefore * 4)} weeks before`;
  return `${monthsBefore} months before`;
}

/**
 * Milestone dates are derived from the event date every render, never
 * stored — move the date in Settings and the whole timeline moves with it.
 */
export function MilestoneTimeline({ limit }: { limit?: number }) {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();
  const { eventDate } = state.profile;

  const items = [...state.milestones]
    .sort((a, b) => b.monthsBefore - a.monthsBefore)
    .slice(0, limit);

  return (
    <ol className="relative space-y-0 border-l border-[var(--line)] pl-6">
      {items.map((m) => {
        const status = milestoneStatus(eventDate, m.monthsBefore, m.done);
        const meta = STATUS_META[status];
        const due = milestoneDate(eventDate, m.monthsBefore);
        const Icon = status === "done" ? Check : status === "overdue" ? TriangleAlert : CircleDot;

        return (
          <li key={m.id} className="relative py-3">
            <span
              aria-hidden
              className={cn(
                "absolute -left-[31px] top-4 flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-full border-2 bg-[var(--surface)]",
              )}
              style={{ borderColor: meta.dot, color: meta.dot }}
            >
              <Icon className="h-3 w-3" />
            </span>

            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={m.done}
                      onChange={() => {
                        dispatch({ type: "milestone/toggle", id: m.id });
                        if (!m.done) toast("Milestone reached", { detail: m.title });
                      }}
                      className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        m.done
                          ? "text-[var(--ink-faint)] line-through"
                          : "font-medium text-[var(--ink)]",
                      )}
                    >
                      {m.title}
                    </span>
                  </label>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">{m.detail}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className="num text-xs font-medium text-[var(--ink)]">
                  {formatDate(new Date(due).toISOString().slice(0, 10))}
                </p>
                <p className="text-xs text-[var(--ink-faint)]">{monthsLabel(m.monthsBefore)}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
