"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Pencil, Sparkles } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { countdown, formatDate } from "@/lib/calculations";
import { EventOrnaments, Motif } from "@/components/ui/EventOrnaments";
import { themeFor } from "@/lib/eventThemes";
import { Button } from "@/components/ui";

function useLiveCountdown(date: string) {
  const [now, setNow] = useState<number | null>(null);

  // Start ticking only after mount: the server has no "now" that would match.
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const base = now ?? Date.parse(`${date}T00:00:00Z`);
  const cd = countdown(date, now ?? base);
  const seconds = now === null ? null : Math.max(0, Math.floor((Date.parse(`${date}T00:00:00Z`) - now) / 1000));

  return {
    ...cd,
    hours: seconds === null ? 0 : Math.floor((seconds % 86_400) / 3600),
    minutes: seconds === null ? 0 : Math.floor((seconds % 3600) / 60),
    secs: seconds === null ? 0 : seconds % 60,
    live: now !== null,
  };
}

export function WelcomeHero({ onEdit }: { onEdit: () => void }) {
  const { state } = useEvent();
  const router = useRouter();
  const { profile } = state;
  const theme = themeFor(profile.eventType);
  const cd = useLiveCountdown(profile.eventDate);

  const units = [
    { value: cd.totalDays, label: cd.totalDays === 1 ? "day" : "days" },
    { value: cd.hours, label: "hrs" },
    { value: cd.minutes, label: "min" },
    { value: cd.secs, label: "sec" },
  ];

  return (
    <section className="eg-hero eg-rise mb-6 rounded-2xl border border-[var(--line)] shadow-[var(--shadow)]">
      {/* Banner — the occasion's own decoration. */}
      <div className="relative h-28 overflow-hidden rounded-t-2xl sm:h-36">
        <Motif eventType={profile.eventType} opacity={0.1} size={60} />
        <EventOrnaments eventType={profile.eventType} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--surface) 2%, color-mix(in srgb, var(--surface) 30%, transparent) 50%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative -mt-8 px-5 pb-6 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="eg-label mb-1.5 text-[var(--primary)]">
              Your {theme.nouns.event} is coming together
            </p>
            <h2 className="font-display text-[1.75rem] leading-tight text-[var(--ink)] sm:text-4xl">
              {profile.title}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--ink-muted)]">{profile.hosts}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--ink-muted)]">
              <span className="num">{formatDate(profile.eventDate, { weekday: "long" })}</span>
              <span aria-hidden className="text-[var(--line-strong)]">
                •
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {profile.city}
              </span>
            </p>
            <p className="mt-2 max-w-xl text-sm text-[var(--ink-muted)]">
              Everything you need to plan it, all in one place.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex shrink-0 items-start gap-2" aria-live="off">
            {units.map((u, i) => (
              <div key={u.label} className="text-center">
                <div
                  className="min-w-[3.1rem] rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2 py-2 shadow-[var(--shadow-sm)]"
                  style={i === 0 ? { borderColor: "var(--gold)" } : undefined}
                >
                  <span className="num block font-display text-xl text-[var(--ink)] tabular-nums">
                    {cd.live ? String(u.value).padStart(2, "0") : "--"}
                  </span>
                </div>
                <span className="mt-1 block text-[0.625rem] uppercase tracking-wider text-[var(--ink-faint)]">
                  {u.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button onClick={() => router.push("/checklist")}>
            Continue planning
            <ArrowRight />
          </Button>
          <Button variant="gold" onClick={() => router.push("/assistant")}>
            <Sparkles />
            Generate ideas
          </Button>
          <Button variant="ghost" onClick={onEdit}>
            <Pencil />
            Edit details
          </Button>
        </div>
      </div>
    </section>
  );
}
