"use client";

import { useState } from "react";
import { Heart, Image as ImageIcon, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { INSPIRATION_CATEGORIES, type InspirationItem } from "@/types/event";
import { Artwork } from "@/components/ui/Artwork";
import { Badge, Button, Dialog, DialogContent, EmptyState, Field, Input, Select, Textarea } from "@/components/ui";

export function InspirationGrid({
  filter,
  favouritesOnly,
  limit,
}: {
  filter?: string;
  favouritesOnly?: boolean;
  limit?: number;
}) {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();
  const [editing, setEditing] = useState<InspirationItem | null>(null);

  const items = state.inspiration
    .filter((i) => (filter && filter !== "All" ? i.category === filter : true))
    .filter((i) => (favouritesOnly ? i.favorite : true))
    .slice(0, limit);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title={favouritesOnly ? "Nothing saved yet" : "No ideas in this category"}
        detail="Save the ones you like, or ask the assistant to suggest some for your theme."
      />
    );
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="eg-card eg-rise group flex flex-col overflow-hidden"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="relative h-36 shrink-0">
              <Artwork seed={item.art} palette={item.palette} />
              <button
                onClick={() => {
                  dispatch({
                    type: "inspiration/update",
                    id: item.id,
                    patch: { favorite: !item.favorite },
                  });
                  toast(item.favorite ? "Removed from favourites" : "Saved to favourites", {
                    detail: item.title,
                    tone: item.favorite ? "info" : "success",
                  });
                }}
                aria-pressed={item.favorite}
                aria-label={item.favorite ? `Unfavourite ${item.title}` : `Favourite ${item.title}`}
                className="absolute right-3 top-3 rounded-lg bg-[var(--surface)]/90 p-2 backdrop-blur transition-colors"
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    item.favorite
                      ? "fill-[var(--primary)] text-[var(--primary)]"
                      : "text-[var(--ink-muted)]",
                  )}
                />
              </button>
              <div className="absolute left-3 top-3 flex gap-1.5">
                <Badge tone="neutral" className="bg-[var(--surface)]/90 backdrop-blur">
                  {item.category}
                </Badge>
                {item.source === "ai" && (
                  <Badge tone="primary" className="gap-1 bg-[var(--surface)]/90 backdrop-blur">
                    <Sparkles className="h-2.5 w-2.5" aria-hidden /> AI
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-display text-base leading-snug text-[var(--ink)]">
                {item.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm text-[var(--ink-muted)]">{item.note}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex gap-1" aria-hidden>
                  {item.palette.map((c) => (
                    <span
                      key={c}
                      className="h-4 w-4 rounded-full border border-[var(--line)]"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <span className="flex opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => setEditing(item)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => {
                      dispatch({ type: "inspiration/delete", id: item.id });
                      toast("Removed from the board", { detail: item.title, tone: "info" });
                    }}
                  >
                    <Trash2 />
                  </Button>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <InspirationDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        editing={editing}
      />
    </>
  );
}

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
  const [category, setCategory] = useState<InspirationItem["category"]>("Florals");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={editing ? "Edit idea" : "Add an idea"}>
        <form onSubmit={submit} className="space-y-4">
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
              onChange={(e) => setCategory(e.target.value as InspirationItem["category"])}
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
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save changes" : "Add to board"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
