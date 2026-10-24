"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { guestSchema, type GuestInput } from "@/lib/validation";
import type { Guest } from "@/types/event";
import { themeFor } from "@/lib/eventThemes";
import { Field, Input, Select, Textarea } from "@/components/ui";
import { FormDialog } from "@/components/ui/FormDialog";

export function GuestDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Guest | null;
}) {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();
  const nouns = themeFor(state.profile.eventType).nouns;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestInput>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      side: nouns.guestGroups[0],
      partySize: 1,
      rsvp: "pending",
      meal: "no preference",
      table: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            name: editing.name,
            side: editing.side,
            partySize: editing.partySize,
            rsvp: editing.rsvp,
            meal: editing.meal,
            table: editing.table === "—" ? "" : editing.table,
            note: editing.note ?? "",
          }
        : {
            name: "",
            side: nouns.guestGroups[0],
            partySize: 1,
            rsvp: "pending",
            meal: "no preference",
            table: "",
            note: "",
          },
    );
    // nouns.guestGroups is stable for a given occasion and only supplies the
    // default grouping; re-running on it would clobber a half-filled form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, reset]);

  function onSubmit(values: GuestInput) {
    const patch = { ...values, table: values.table || "—" };
    if (editing) {
      dispatch({ type: "guest/update", id: editing.id, patch });
      toast("Guest updated", { detail: values.name });
    } else {
      dispatch({ type: "guest/add", guest: patch });
      toast("Guest added", {
        detail: `${values.name} · party of ${values.partySize}`,
      });
    }
    onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit guest" : "Add a guest"}
      description="Add households rather than individuals — party size does the counting."
      submitLabel={editing ? "Save changes" : "Add guest"}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Field label="Name" error={errors.name?.message} htmlFor="guest-name">
        <Input
          id="guest-name"
          placeholder="The Kapoor family"
          {...register("name")}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={nouns.guestGroup}
          error={errors.side?.message}
          htmlFor="guest-side"
        >
          <Input
            id="guest-side"
            list="guest-side-options"
            {...register("side")}
          />
          <datalist id="guest-side-options">
            {nouns.guestGroups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </Field>
        <Field
          label="Party size"
          error={errors.partySize?.message}
          htmlFor="guest-size"
        >
          <Input
            id="guest-size"
            type="number"
            min={1}
            max={30}
            className="num"
            {...register("partySize", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="RSVP" error={errors.rsvp?.message} htmlFor="guest-rsvp">
          <Select id="guest-rsvp" {...register("rsvp")}>
            <option value="pending">Awaiting reply</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </Select>
        </Field>
        <Field label="Meal" error={errors.meal?.message} htmlFor="guest-meal">
          <Select id="guest-meal" {...register("meal")}>
            <option value="no preference">No preference</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
            <option value="non-vegetarian">Non-vegetarian</option>
          </Select>
        </Field>
      </div>

      <Field
        label="Table"
        error={errors.table?.message}
        hint="Leave blank until seating is planned"
        htmlFor="guest-table"
      >
        <Input id="guest-table" placeholder="T4" {...register("table")} />
      </Field>

      <Field label="Note" error={errors.note?.message} htmlFor="guest-note">
        <Textarea
          id="guest-note"
          rows={2}
          placeholder="Optional"
          {...register("note")}
        />
      </Field>
    </FormDialog>
  );
}
