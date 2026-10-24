"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { taskSchema, type TaskInput } from "@/lib/validation";
import { TASK_CATEGORIES, type Task } from "@/types/event";
import { ownerOptions } from "@/lib/utils";
import { Field, Input, Select } from "@/components/ui";
import { FormDialog } from "@/components/ui/FormDialog";

export function TaskDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Task | null;
}) {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();

  const owners = ownerOptions(state.profile.hosts);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      category: "Vendors",
      dueDate: "",
      priority: "medium",
      owner: owners[0],
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            title: editing.title,
            category: editing.category,
            dueDate: editing.dueDate,
            priority: editing.priority,
            owner: editing.owner,
          }
        : {
            title: "",
            category: "Vendors",
            // Default to a fortnight out: near enough to be real, far enough to plan.
            dueDate: new Date(Date.now() + 14 * 86_400_000)
              .toISOString()
              .slice(0, 10),
            priority: "medium",
            owner: owners[0],
          },
    );
    // owners is derived from profile names and stable per render of this dialog
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, reset]);

  function onSubmit(values: TaskInput) {
    if (editing) {
      dispatch({ type: "task/update", id: editing.id, patch: values });
      toast("Task updated", { detail: values.title });
    } else {
      dispatch({ type: "task/add", task: values });
      toast("Task added", { detail: values.title });
    }
    onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit task" : "Add a task"}
      submitLabel={editing ? "Save changes" : "Add task"}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Field label="Task" error={errors.title?.message} htmlFor="task-title">
        <Input
          id="task-title"
          placeholder="Confirm the catering menu"
          {...register("title")}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Category"
          error={errors.category?.message}
          htmlFor="task-cat"
        >
          <Select id="task-cat" {...register("category")}>
            {TASK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Due date"
          error={errors.dueDate?.message}
          htmlFor="task-due"
        >
          <Input id="task-due" type="date" {...register("dueDate")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Priority"
          error={errors.priority?.message}
          htmlFor="task-pri"
        >
          <Select id="task-pri" {...register("priority")}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </Field>
        <Field label="Owner" error={errors.owner?.message} htmlFor="task-owner">
          <Input
            id="task-owner"
            list="task-owner-options"
            {...register("owner")}
          />
          <datalist id="task-owner-options">
            {owners.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </Field>
      </div>
    </FormDialog>
  );
}
