"use client";

import { useMemo } from "react";
import { ListChecks } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { isOverdue } from "@/lib/calculations";
import type { Task } from "@/types/event";
import { Button, EmptyState } from "@/components/ui";
import type { TaskFilter } from "./filters";
import { TaskRow } from "./TaskRow";

/** The filtered, sorted checklist. */
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
