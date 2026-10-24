"use client";

import { CalendarClock } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { countdown, formatDate, milestoneStatus } from "@/lib/calculations";
import { Badge, Card, CardHeader, PageHeading } from "@/components/ui";
import { MilestoneTimeline } from "@/components/timeline/MilestoneTimeline";

export default function TimelinePage() {
  const { state } = useEvent();
  const { eventDate } = state.profile;
  const cd = countdown(eventDate);

  const tally = state.milestones.reduce(
    (acc, m) => {
      acc[milestoneStatus(eventDate, m.monthsBefore, m.done)] += 1;
      return acc;
    },
    { done: 0, overdue: 0, active: 0, upcoming: 0 },
  );

  return (
    <>
      <PageHeading
        title="Timeline"
        subtitle={`${formatDate(eventDate, { weekday: "long" })} · ${cd.totalDays} days away`}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Reached", value: tally.done, tone: "var(--success)" },
          { label: "Due now", value: tally.active, tone: "var(--gold)" },
          { label: "Overdue", value: tally.overdue, tone: "var(--danger)" },
          { label: "Ahead", value: tally.upcoming, tone: "var(--ink-muted)" },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3">
            <p className="eg-label">{s.label}</p>
            <p className="num mt-0.5 font-display text-2xl" style={{ color: s.tone }}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <CardHeader
          icon={CalendarClock}
          title="Planning milestones"
          subtitle="Dates are derived from your event date — move the date and these all move with it."
          action={<Badge tone="gold">{state.milestones.length} milestones</Badge>}
        />
        <div className="mt-5">
          <MilestoneTimeline />
        </div>
      </Card>
    </>
  );
}
