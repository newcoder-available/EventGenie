"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import type { Guest } from "@/types/event";
import { Button, Card, CardHeader, PageHeading, Progress } from "@/components/ui";
import { GuestDialog } from "@/components/guests/GuestDialog";
import { GuestTable, RsvpSummary } from "@/components/guests/GuestTable";
import { Users } from "lucide-react";

export default function GuestsPage() {
  const { summary } = useEvent();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const g = summary.guests;

  function add() {
    setEditing(null);
    setOpen(true);
  }

  return (
    <>
      <PageHeading
        title="Guests & RSVP"
        subtitle={`${g.households} households · ${g.invited} people invited`}
        action={
          <Button onClick={add}>
            <Plus />
            Add guest
          </Button>
        }
      />

      <Card className="mb-4 p-5">
        <RsvpSummary />
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-[var(--ink-muted)]">
              {g.responseRate}% of households have replied
            </span>
            <span className="num text-[var(--ink-faint)]">
              {g.accepted} attending so far
            </span>
          </div>
          <Progress value={g.responseRate} tone="success" label="RSVP response rate" />
        </div>
        {g.pending > 0 && (
          <p className="mt-3 text-xs text-[var(--ink-muted)]">
            Your caterer prices on the final number, so chase the {g.pending} outstanding replies
            before the menu is locked.
          </p>
        )}
      </Card>

      <Card className="p-5">
        <CardHeader
          icon={Users}
          title="Guest list"
          subtitle="Change an RSVP inline — the counts above move with it."
        />
        <div className="mt-4">
          <GuestTable
            onAdd={add}
            onEdit={(guest) => {
              setEditing(guest);
              setOpen(true);
            }}
          />
        </div>
      </Card>

      <GuestDialog open={open} onOpenChange={setOpen} editing={editing} />
    </>
  );
}
