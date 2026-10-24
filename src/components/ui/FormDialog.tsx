"use client";

import { Button, Dialog, DialogContent } from "@/components/ui";

/**
 * The scaffolding every editing dialog in the app shares: a titled modal, a
 * form element, and a Cancel/Submit footer.
 *
 * Four dialogs were repeating this, which is four chances for the submit
 * button to drift out of alignment or the cancel to stop closing. Callers now
 * supply only their fields and their submit handler.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
  busy = false,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  /** Usually react-hook-form's handleSubmit(...). */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  busy?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title} description={description}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {children}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
