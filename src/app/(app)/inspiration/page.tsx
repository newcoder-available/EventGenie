"use client";

import { useState } from "react";
import { Heart, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEvent } from "@/hooks/useEvent";
import { INSPIRATION_CATEGORIES } from "@/types/event";
import { cn } from "@/lib/utils";
import { Button, Card, PageHeading } from "@/components/ui";
import { InspirationGrid } from "@/components/inspiration/InspirationGrid";
import { InspirationDialog } from "@/components/inspiration/InspirationDialog";

export default function InspirationPage() {
  const { state } = useEvent();
  const router = useRouter();
  const [filter, setFilter] = useState<string>("All");
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [open, setOpen] = useState(false);

  const saved = state.inspiration.filter((i) => i.favorite).length;
  const tabs = ["All", ...INSPIRATION_CATEGORIES];

  return (
    <>
      <PageHeading
        title="Inspiration board"
        subtitle={`${state.inspiration.length} ideas · ${saved} saved to favourites`}
        action={
          <>
            <Button variant="gold" onClick={() => router.push("/assistant")}>
              <Sparkles />
              Generate ideas with AI
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus />
              Add idea
            </Button>
          </>
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              aria-pressed={filter === t}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === t
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--line-strong)] text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)]",
              )}
            >
              {t}
            </button>
          ))}
          <span aria-hidden className="mx-1 h-5 w-px bg-[var(--line)]" />
          <button
            onClick={() => setFavouritesOnly((v) => !v)}
            aria-pressed={favouritesOnly}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              favouritesOnly
                ? "border-[var(--primary)] bg-[var(--primary-tint)] text-[var(--primary-deep)]"
                : "border-[var(--line-strong)] text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)]",
            )}
          >
            <Heart className={cn("h-3 w-3", favouritesOnly && "fill-[var(--primary)]")} aria-hidden />
            Favourites only
          </button>
        </div>
      </Card>

      <InspirationGrid filter={filter} favouritesOnly={favouritesOnly} />

      <InspirationDialog open={open} onOpenChange={setOpen} editing={null} />
    </>
  );
}
