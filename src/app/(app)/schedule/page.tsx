"use client";

import { CalendarHeart, Printer } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { themeFor } from "@/lib/eventThemes";
import { formatDate } from "@/lib/calculations";
import { Button, Card, CardHeader, PageHeading } from "@/components/ui";
import { RunSheet } from "@/components/schedule/RunSheet";

export default function SchedulePage() {
  const { state } = useEvent();
  const { profile, schedule } = state;
  const nouns = themeFor(state.profile.eventType).nouns;

  const first = schedule[0]?.time ?? "—";
  const last = schedule[schedule.length - 1]?.time ?? "—";

  return (
    <>
      <PageHeading
        title={`${nouns.dayName} schedule`}
        subtitle={`${formatDate(profile.eventDate, { weekday: "long" })} · ${schedule.length} slots from ${first} to ${last}`}
        action={
          <Button variant="secondary" className="no-print" onClick={() => window.print()}>
            <Printer />
            Print run sheet
          </Button>
        }
      />

      <Card className="p-5">
        <CardHeader
          icon={CalendarHeart}
          title="Running order"
          subtitle="One page, hour by hour, with a name against every line. Print it and hand it out."
        />
        <div className="mt-5">
          <RunSheet />
        </div>
      </Card>
    </>
  );
}
