"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarHeart, Clock, Pencil, Trash2, User } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { endTime } from "@/lib/calculations";
import { scheduleSchema, type ScheduleInput } from "@/lib/validation";
import type { ScheduleSlot } from "@/types/event";
import { Button, Dialog, DialogContent, EmptyState, Field, Input, Textarea } from "@/components/ui";

/** The event-day run sheet: who does what, in order, with a time against it. */
export function RunSheet({ limit }: { limit?: number }) {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();
  const [editing, setEditing] = useState<ScheduleSlot | null>(null);
  const [adding, setAdding] = useState(false);

  const slots = [...state.schedule].sort((a, b) => a.time.localeCompare(b.time));
  const shown = limit ? slots.slice(0, limit) : slots;

  if (shown.length === 0) {
    return (
      <EmptyState
        icon={CalendarHeart}
        title="The day is empty"
        detail="Build the run sheet hour by hour so nobody has to ask what happens next."
        action={<Button onClick={() => setAdding(true)}>Add the first slot</Button>}
      />
    );
  }

  return (
    <>
      {!limit && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setAdding(true)}>
            <Clock />
            Add a slot
          </Button>
        </div>
      )}

      <ol className="relative space-y-0">
        {shown.map((slot, i) => (
          <li key={slot.id} className="group relative flex gap-4 py-3">
            {/* Time rail */}
            <div className="w-16 shrink-0 text-right sm:w-20">
              <p className="num font-display text-base text-[var(--ink)]">{slot.time}</p>
              <p className="num text-xs text-[var(--ink-faint)]">
                to {endTime(slot.time, slot.durationMinutes)}
              </p>
            </div>

            <div className="relative flex shrink-0 flex-col items-center">
              <span
                aria-hidden
                className="mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--primary)] bg-[var(--surface)]"
              />
              {i < shown.length - 1 && (
                <span aria-hidden className="w-px flex-1 bg-[var(--line)]" />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-[var(--ink)]">{slot.title}</h3>
                  <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{slot.detail}</p>
                  {slot.owner && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--ink-faint)]">
                      <User className="h-3 w-3" aria-hidden />
                      {slot.owner}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${slot.title}`}
                    onClick={() => setEditing(slot)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${slot.title}`}
                    onClick={() => {
                      dispatch({ type: "schedule/delete", id: slot.id });
                      toast("Slot removed", { detail: slot.title, tone: "info" });
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <SlotDialog
        open={adding || editing !== null}
        onOpenChange={(o) => {
          if (!o) {
            setAdding(false);
            setEditing(null);
          }
        }}
        editing={editing}
      />
    </>
  );
}

function SlotDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: ScheduleSlot | null;
}) {
  const { dispatch } = useEvent();
  const { toast } = useToast();
  const [lastOpen, setLastOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleInput>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { time: "12:00", durationMinutes: 60, title: "", detail: "", owner: "" },
  });

  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      reset(
        editing
          ? {
              time: editing.time,
              durationMinutes: editing.durationMinutes,
              title: editing.title,
              detail: editing.detail,
              owner: editing.owner,
            }
          : { time: "12:00", durationMinutes: 60, title: "", detail: "", owner: "" },
      );
    }
  }

  function onSubmit(values: ScheduleInput) {
    if (editing) {
      dispatch({ type: "schedule/update", id: editing.id, patch: values });
      toast("Schedule updated", { detail: values.title });
    } else {
      dispatch({ type: "schedule/add", slot: values });
      toast("Added to the run sheet", { detail: `${values.time} · ${values.title}` });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={editing ? "Edit slot" : "Add a slot"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="What happens" error={errors.title?.message} htmlFor="slot-title">
            <Input id="slot-title" placeholder="Baraat from the main gate" {...register("title")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time" error={errors.time?.message} htmlFor="slot-time">
              <Input id="slot-time" type="time" {...register("time")} />
            </Field>
            <Field
              label="Minutes"
              error={errors.durationMinutes?.message}
              htmlFor="slot-duration"
            >
              <Input
                id="slot-duration"
                type="number"
                min={5}
                step={5}
                className="num"
                {...register("durationMinutes", { valueAsNumber: true })}
              />
            </Field>
          </div>
          <Field label="Detail" error={errors.detail?.message} htmlFor="slot-detail">
            <Textarea
              id="slot-detail"
              rows={2}
              placeholder="Dhol party, vintage car, 15-minute procession"
              {...register("detail")}
            />
          </Field>
          <Field label="Who owns it" error={errors.owner?.message} htmlFor="slot-owner">
            <Input id="slot-owner" placeholder="Venue team" {...register("owner")} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save changes" : "Add slot"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
