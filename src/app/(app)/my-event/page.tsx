"use client";

import { useState } from "react";
import {
  CalendarHeart,
  Heart,
  ListChecks,
  MapPin,
  Palette,
  Pencil,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { themeFor } from "@/lib/eventThemes";
import { countdown, formatDate, formatMoney } from "@/lib/calculations";
import { Artwork } from "@/components/ui/Artwork";
import { Badge, Button, Card, CardHeader, PageHeading, Progress } from "@/components/ui";
import { ProfileDialog } from "@/components/dashboard/ProfileDialog";

export default function MyEventPage() {
  const { state, summary } = useEvent();
  const [open, setOpen] = useState(false);
  const nouns = themeFor(state.profile.eventType).nouns;
  const { profile } = state;

  const cd = countdown(profile.eventDate);
  const { budget, guests, vendors, progress } = summary;

  const facts = [
    { icon: CalendarHeart, label: "Date", value: formatDate(profile.eventDate, { weekday: "long" }) },
    { icon: MapPin, label: "City", value: profile.city },
    { icon: Heart, label: "Venue", value: profile.venue || "Not decided yet" },
    { icon: Users, label: "Guests invited", value: `${guests.invited} across ${guests.households} households` },
    { icon: Wallet, label: "Budget", value: formatMoney(profile.totalBudget, profile.currency) },
    { icon: Palette, label: "Theme", value: profile.theme || "Not set" },
  ];

  return (
    <>
      <PageHeading
        title={nouns.profileLabel}
        subtitle="The details everything else is calculated from."
        action={
          <Button onClick={() => setOpen(true)}>
            <Pencil />
            Edit details
          </Button>
        }
      />

      <Card className="mb-4 overflow-hidden">
        <div className="relative h-32 sm:h-40">
          <Artwork seed={1} palette={["#8f3150", "#c8a96b"]} detail="tile" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--surface) 3%, color-mix(in srgb, var(--surface) 30%, transparent) 50%, transparent)",
            }}
          />
        </div>
        <div className="relative -mt-10 px-5 pb-5 sm:px-7">
          <h2 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
            {profile.title}
          </h2>
          <p className="num mt-2 text-sm text-[var(--ink-muted)]">
            {cd.past
              ? "Congratulations — the day has passed."
              : `${cd.totalDays} days away · ${cd.months} months and ${cd.weeks} weeks`}
          </p>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-tint)] text-[var(--primary)]">
                  <f.icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="eg-label">{f.label}</dt>
                  <dd className="mt-0.5 text-sm text-[var(--ink)]">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader
            icon={ListChecks}
            title="How far along you are"
            subtitle="Weighted across tasks, vendors, replies and milestones."
            action={<Badge tone="gold">{progress.percent}%</Badge>}
          />
          <div className="mt-4 space-y-4">
            {[
              { label: "Tasks completed", value: progress.tasks.percent, detail: `${progress.tasks.done}/${progress.tasks.total}` },
              { label: "Vendors booked", value: vendors.percent, detail: `${vendors.booked}/${vendors.total}` },
              { label: "RSVPs received", value: guests.responseRate, detail: `${guests.households - state.guests.filter((g) => g.rsvp === "pending").length}/${guests.households}` },
              { label: "Milestones reached", value: progress.milestonePercent, detail: `${state.milestones.filter((m) => m.done).length}/${state.milestones.length}` },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-[var(--ink-muted)]">{row.label}</span>
                  <span className="num text-[var(--ink-faint)]">{row.detail}</span>
                </div>
                <Progress value={row.value} label={row.label} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader
            icon={Store}
            title="Where you stand"
            subtitle="The four numbers worth checking each week."
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Committed", value: formatMoney(budget.committed, profile.currency, true), tone: "var(--ink)" },
              {
                label: budget.overBudget ? "Over budget" : "Still unspent",
                value: formatMoney(Math.abs(budget.remaining), profile.currency, true),
                tone: budget.overBudget ? "var(--danger)" : "var(--success)",
              },
              { label: "Attending", value: String(guests.accepted), tone: "var(--ink)" },
              { label: "Awaiting reply", value: String(guests.pending), tone: "var(--warning)" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-[var(--surface-sunken)] px-3 py-3">
                <p className="eg-label">{s.label}</p>
                <p className="num mt-0.5 font-display text-xl" style={{ color: s.tone }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--ink-faint)]">
            Every figure on this page is derived from your budget, checklist, guest list and vendor
            tracker. Change one and this page moves with it.
          </p>
        </Card>
      </div>

      <ProfileDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
