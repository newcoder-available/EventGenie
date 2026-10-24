"use client";

import { useMemo, useState } from "react";
import { ListChecks, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { formatDate, isOverdue } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/event";
import { Badge, Button, EmptyState, Progress } from "@/components/ui";

export const TASK_FILTERS = ["All", "Pending", "Completed", "Overdue"] as const;
export type TaskFilter = (typeof TASK_FILTERS)[number];

const PRIORITY_TONE = {
  high: "danger",
  medium: "warning",
  low: "neutral",
} as const;

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
    <div role="tablist" aria-label="Filter tasks" className="flex flex-wrap gap-1.5">
      {TASK_FILTERS.map((f) => (
        <button
          key={f}
          role="tab"
          aria-selected={value === f}
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

export function TaskRow({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const { dispatch } = useEvent();
  const { toast } = useToast();
  const overdue = isOverdue(task.dueDate, task.done);

  return (
    <li className="group flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[var(--surface-sunken)]/70">
      <input
        type="checkbox"
        checked={task.done}
        id={`task-${task.id}`}
        onChange={() => {
          dispatch({ type: "task/toggle", id: task.id });
          if (!task.done) toast("Task completed", { detail: task.title });
        }}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--primary)]"
      />

      <div className="min-w-0 flex-1">
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            "block cursor-pointer text-sm",
            task.done ? "text-[var(--ink-faint)] line-through" : "font-medium text-[var(--ink)]",
          )}
        >
          {task.title}
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--ink-faint)]">
          <span className="num">{formatDate(task.dueDate)}</span>
          <span aria-hidden>·</span>
          <span>{task.category}</span>
          <span aria-hidden>·</span>
          <span>{task.owner}</span>
          {task.source === "ai" && (
            <Badge tone="primary" className="gap-1 py-0">
              <Sparkles className="h-2.5 w-2.5" aria-hidden /> AI
            </Badge>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {overdue && <Badge tone="danger">Overdue</Badge>}
        {!task.done && !overdue && (
          <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
        )}
        <div className="flex opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Button variant="ghost" size="icon" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}>
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${task.title}`}
            onClick={() => {
              dispatch({ type: "task/delete", id: task.id });
              toast("Task deleted", { detail: task.title, tone: "info" });
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function TaskList({
  filter,
  search = "",
  limit,
  onEdit,
  onAdd,
}: {
  filter: TaskFilter;
  search?: string;
  limit?: number;
  onEdit: (t: Task) => void;
  onAdd?: () => void;
}) {
  const { state } = useEvent();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.tasks
      .filter((t) => {
        if (q && !t.title.toLowerCase().includes(q) && !t.owner.toLowerCase().includes(q))
          return false;
        if (filter === "Pending") return !t.done;
        if (filter === "Completed") return t.done;
        if (filter === "Overdue") return isOverdue(t.dueDate, t.done);
        return true;
      })
      // Open work first, then by due date — the order you would actually work in.
      .sort((a, b) =>
        a.done === b.done ? a.dueDate.localeCompare(b.dueDate) : a.done ? 1 : -1,
      );
  }, [state.tasks, filter, search]);

  const shown = limit ? filtered.slice(0, limit) : filtered;

  if (shown.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title={search ? "Nothing matches that search" : `No ${filter.toLowerCase()} tasks`}
        detail={
          filter === "Overdue"
            ? "Nothing has slipped. That is worth noticing."
            : "Add a task and it will appear here and in your progress."
        }
        action={onAdd ? <Button onClick={onAdd}>Add a task</Button> : undefined}
      />
    );
  }

  return (
    <ul className="-mx-2">
      {shown.map((t) => (
        <TaskRow key={t.id} task={t} onEdit={onEdit} />
      ))}
    </ul>
  );
}

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
