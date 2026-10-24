"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import { themeFor } from "@/lib/eventThemes";
import { Button, Dialog, DialogContent, Field, Input, Select } from "@/components/ui";

export function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();
  const nouns = themeFor(state.profile.eventType).nouns;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: state.profile,
  });

  useEffect(() => {
    if (open) reset(state.profile);
  }, [open, state.profile, reset]);

  function onSubmit(values: ProfileInput) {
    dispatch({ type: "profile/set", profile: values });
    toast("Event details saved", {
      detail: "The countdown and every milestone date moved with it.",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={`Your ${nouns.event}`}
        description="Change the date and the whole timeline recalculates around it."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="What is it called"
              error={errors.title?.message}
              hint="Shown as the headline on your dashboard"
              htmlFor="p1"
            >
              <Input id="p1" {...register("title")} />
            </Field>
            <Field
              label={nouns.host}
              error={errors.hosts?.message}
              hint="Who is hosting"
              htmlFor="p2"
            >
              <Input id="p2" {...register("hosts")} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" error={errors.eventDate?.message} htmlFor="wdate">
              <Input id="wdate" type="date" {...register("eventDate")} />
            </Field>
            <Field label="City" error={errors.city?.message} htmlFor="wcity">
              <Input id="wcity" {...register("city")} />
            </Field>
          </div>

          <Field label="Venue" error={errors.venue?.message} htmlFor="wvenue">
            <Input id="wvenue" placeholder="Not decided yet" {...register("venue")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <Field label="Currency" error={errors.currency?.message} htmlFor="wcur">
              <Select id="wcur" {...register("currency")}>
                {["INR", "USD", "GBP", "EUR", "AED", "SGD"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Total budget" error={errors.totalBudget?.message} htmlFor="wbudget">
              <Input
                id="wbudget"
                type="number"
                min={1000}
                step={10000}
                className="num"
                {...register("totalBudget", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <Field
            label="Theme"
            error={errors.theme?.message}
            hint="The assistant reads this when it suggests ideas."
            htmlFor="wtheme"
          >
            <Input
              id="wtheme"
              placeholder="Royal Rajasthani — marigold, ivory and old gold"
              {...register("theme")}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save details</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
