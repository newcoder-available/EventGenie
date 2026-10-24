"use client";

import { useState } from "react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { INSPIRATION_CATEGORIES, type InspirationItem } from "@/types/event";
import { Field, Input, Select, Textarea } from "@/components/ui";
import { FormDialog } from "@/components/ui/FormDialog";

export function InspirationDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: InspirationItem | null;
}) {
  const { dispatch } = useEvent();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<InspirationItem["category"]>("Florals");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Seed the fields each time the dialog opens.
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setTitle(editing?.title ?? "");
      setCategory(editing?.category ?? "Florals");
      setNote(editing?.note ?? "");
      setError("");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 2) {
      setError("Give the idea a name");
      return;
    }
    if (editing) {
      dispatch({
        type: "inspiration/update",
        id: editing.id,
        patch: { title: title.trim(), category, note: note.trim() },
      });
      toast("Idea updated", { detail: title.trim() });
    } else {
      dispatch({
        type: "inspiration/add",
        item: {
          title: title.trim(),
          category,
          note: note.trim(),
          favorite: false,
          palette: ["#9e2b52", "#b3801a"],
          art: Math.floor(Math.random() * 40),
        },
      });
      toast("Idea added to the board", { detail: title.trim() });
    }
    onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit idea" : "Add an idea"}
      submitLabel={editing ? "Save changes" : "Add to board"}
      onSubmit={submit}
    >
      <Field label="Idea" error={error} htmlFor="insp-title">
        <Input
          id="insp-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Hanging marigold over the aisle"
        />
      </Field>
      <Field label="Category" htmlFor="insp-cat">
        <Select
          id="insp-cat"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as InspirationItem["category"])
          }
        >
          {INSPIRATION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Note" htmlFor="insp-note">
        <Textarea
          id="insp-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What you like about it, or what to ask the decorator"
        />
      </Field>
    </FormDialog>
  );
}
