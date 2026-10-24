"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { taskSummary } from "@/lib/calculations";
import type { Task } from "@/types/event";
import { Button, Card, Input, PageHeading, Progress } from "@/components/ui";
import { TaskDialog } from "@/components/checklist/TaskDialog";
import { TaskFilterBar, TaskList, type TaskFilter } from "@/components/checklist/TaskList";

export default function ChecklistPage() {
  const { state } = useEvent();
  const [filter, setFilter] = useState<TaskFilter>("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const summary = taskSummary(state);
  const counts: Record<TaskFilter, number> = {
    All: summary.total,
    Pending: summary.pending,
    Completed: summary.done,
    Overdue: summary.overdue,
  };

  function add() {
    setEditing(null);
    setOpen(true);
  }

  return (
    <>
      <PageHeading
        title="Checklist"
        subtitle={`${summary.done} of ${summary.total} done${summary.overdue ? ` · ${summary.overdue} overdue` : ""}`}
        action={
          <Button onClick={add}>
            <Plus />
            Add task
          </Button>
        }
      />

      <Card className="mb-4 p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="eg-label">Overall progress</p>
          <p className="num text-sm font-medium text-[var(--ink)]">{summary.percent}%</p>
        </div>
        <Progress value={summary.percent} label="Checklist progress" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: summary.total, tone: "var(--ink)" },
            { label: "Done", value: summary.done, tone: "var(--success)" },
            { label: "Pending", value: summary.pending, tone: "var(--warning)" },
            { label: "Overdue", value: summary.overdue, tone: "var(--danger)" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-[var(--surface-sunken)] px-3 py-2.5">
              <p className="eg-label">{s.label}</p>
              <p className="num mt-0.5 font-display text-xl" style={{ color: s.tone }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TaskFilterBar value={filter} onChange={setFilter} counts={counts} />
          <div className="min-w-[12rem] flex-1 sm:max-w-xs">
            <label htmlFor="task-search" className="sr-only">
              Search tasks
            </label>
            <Input
              id="task-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks or owners"
            />
          </div>
        </div>

        <TaskList
          filter={filter}
          search={search}
          onEdit={(t) => {
            setEditing(t);
            setOpen(true);
          }}
          onAdd={add}
        />
      </Card>

      <TaskDialog open={open} onOpenChange={setOpen} editing={editing} />
    </>
  );
}
