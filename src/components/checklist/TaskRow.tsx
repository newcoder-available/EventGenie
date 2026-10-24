"use client";

import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { formatDate, isOverdue } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/event";
import { Badge, Button } from "@/components/ui";
import { PRIORITY_TONE } from "./filters";

/** One checklist row: tick, detail line, priority and the hover actions. */
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
