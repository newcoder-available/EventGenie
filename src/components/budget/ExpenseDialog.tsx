"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { expenseSchema, type ExpenseInput } from "@/lib/validation";
import { BUDGET_CATEGORIES, type Expense } from "@/types/event";
import {
  Button,
  Dialog,
  DialogContent,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

export function ExpenseDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent means "add new". */
  editing?: Expense | null;
}) {
  const { dispatch } = useEvent();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "Venue",
      label: "",
      estimated: 0,
      actual: 0,
      paidOn: "",
      note: "",
    },
  });

  // Reset whenever the dialog opens so an edit never inherits the last form.
  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            category: editing.category,
            label: editing.label,
            estimated: editing.estimated,
            actual: editing.actual,
            paidOn: editing.paidOn,
            note: editing.note ?? "",
          }
        : { category: "Venue", label: "", estimated: 0, actual: 0, paidOn: "", note: "" },
    );
  }, [open, editing, reset]);

  function onSubmit(values: ExpenseInput) {
    if (editing) {
      dispatch({ type: "expense/update", id: editing.id, patch: values });
      toast("Expense updated", { detail: values.label });
    } else {
      dispatch({ type: "expense/add", expense: values });
      toast("Expense added", { detail: `${values.label} · ${values.category}` });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={editing ? "Edit expense" : "Add an expense"}
        description="Leave the actual amount at zero while a line is still only planned."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="What is it for" error={errors.label?.message} htmlFor="exp-label">
            <Input id="exp-label" placeholder="Mandap and stage florals" {...register("label")} />
          </Field>

          <Field label="Category" error={errors.category?.message} htmlFor="exp-category">
            <Select id="exp-category" {...register("category")}>
              {BUDGET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estimated" error={errors.estimated?.message} htmlFor="exp-est">
              <Input
                id="exp-est"
                type="number"
                min={0}
                step={1000}
                className="num"
                {...register("estimated", { valueAsNumber: true })}
              />
            </Field>
            <Field
              label="Actually paid"
              error={errors.actual?.message}
              hint="Zero until it is paid"
              htmlFor="exp-act"
            >
              <Input
                id="exp-act"
                type="number"
                min={0}
                step={1000}
                className="num"
                {...register("actual", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <Field label="Paid on" error={errors.paidOn?.message} htmlFor="exp-paid">
            <Input id="exp-paid" type="date" {...register("paidOn")} />
          </Field>

          <Field label="Note" error={errors.note?.message} htmlFor="exp-note">
            <Textarea id="exp-note" rows={2} placeholder="Optional" {...register("note")} />
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {editing ? "Save changes" : "Add expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
