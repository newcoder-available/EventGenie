"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ListChecks, Sparkles, Users, Wallet } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { EVENT_ORDER, EVENT_THEMES, themeFor } from "@/lib/eventThemes";
import { templateFor } from "@/data/events";
import { formatMoney } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { EventType } from "@/types/event";
import { Button } from "@/components/ui";
import { EventIcon, EventOrnaments, Motif } from "@/components/ui/EventOrnaments";
import { Logo } from "@/components/layout/Sidebar";

/**
 * Step one: what are we planning?
 *
 * Choosing here does two things at once — it decides which plan the app
 * loads, and it re-skins the product. The tiles preview their own accent and
 * motif so the change is visible before you commit to it.
 */
export default function LandingPage() {
  const router = useRouter();
  const { eventType, chooseEvent } = useSession();
  const [hovered, setHovered] = useState<EventType | null>(null);

  const preview = hovered ?? eventType ?? "wedding";
  const theme = themeFor(preview);

  function pick(type: EventType) {
    chooseEvent(type);
    router.push("/signin");
  }

  return (
    <div className="relative">
      {/* The whole page takes the previewed occasion's accent. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full opacity-[0.07] blur-3xl" style={{ background: theme.accent }} />
        <div className="absolute -bottom-32 -left-24 h-[24rem] w-[24rem] rounded-full opacity-[0.06] blur-3xl" style={{ background: theme.secondary }} />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <a
          href="#occasions"
          className="text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--primary)]"
        >
          Start planning
        </a>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        {/* Hero */}
        <section className="eg-hero relative mb-10 overflow-hidden rounded-3xl border border-[var(--line)] px-6 py-10 shadow-[var(--shadow)] sm:px-10 sm:py-14">
          <EventOrnaments eventType={preview} />
          <div className="relative max-w-xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--ink-muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
              AI planning for any celebration
            </span>
            <h1 className="font-display text-[2.1rem] leading-[1.1] text-[var(--ink)] sm:text-[3rem]">
              Every celebration runs on the{" "}
              <span className="text-[var(--primary)]">same four things</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--ink-muted)]">
              Money, time, people and suppliers. EventGenie gives you all four in one place —
              a budget that adds up, a checklist in the right order, RSVPs that count
              themselves, and a planner that can write the next step for you.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button size="lg" onClick={() => document.getElementById("occasions")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                Choose your occasion
                <ArrowRight />
              </Button>
              <span className="text-xs text-[var(--ink-faint)]">
                No account needed — everything stays in this browser.
              </span>
            </div>
          </div>
        </section>

        {/* Occasion picker */}
        <section id="occasions" className="scroll-mt-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eg-label mb-1">Step 1 of 2</p>
              <h2 className="font-display text-2xl text-[var(--ink)]">What are you planning?</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                The whole app changes to suit it — colours, checklist, budget split, vendors and
                the run sheet.
              </p>
            </div>
            {eventType && (
              <Button variant="secondary" onClick={() => router.push("/signin")}>
                Continue with {themeFor(eventType).label.toLowerCase()}
                <ArrowRight />
              </Button>
            )}
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EVENT_ORDER.map((type) => {
              const t = EVENT_THEMES[type];
              const template = templateFor(type);
              const selected = eventType === type;
              return (
                <li key={type}>
                  <button
                    onClick={() => pick(type)}
                    onMouseEnter={() => setHovered(type)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(type)}
                    onBlur={() => setHovered(null)}
                    aria-pressed={selected}
                    // Each tile wears its own accent, so the palette is
                    // visible before you commit to it.
                    style={
                      {
                        "--primary": t.accent,
                        "--primary-deep": t.accentDeep,
                        "--primary-tint": t.accentTint,
                      } as React.CSSProperties
                    }
                    className={cn(
                      "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-[var(--surface)] p-5 text-left transition-all",
                      selected
                        ? "border-[var(--primary)] shadow-[var(--shadow-lg)]"
                        : "border-[var(--line)] hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:shadow-[var(--shadow-lg)]",
                    )}
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 aria-pressed:opacity-100">
                      <Motif eventType={type} opacity={0.07} size={56} />
                    </div>
                    {selected && (
                      <Motif eventType={type} opacity={0.08} size={56} className="absolute inset-0" />
                    )}

                    <div className="relative mb-3 flex items-start justify-between">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--primary)]"
                        style={{ background: t.accentTint }}
                      >
                        <EventIcon eventType={type} className="h-5 w-5" />
                      </span>
                      {selected && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        </span>
                      )}
                    </div>

                    <h3 className="relative font-display text-lg text-[var(--ink)]">{t.label}</h3>
                    <p className="relative mt-1 flex-1 text-sm text-[var(--ink-muted)]">{t.blurb}</p>

                    <dl className="relative mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--line)] pt-3 text-xs text-[var(--ink-faint)]">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" aria-hidden />
                        <dt className="sr-only">Typical guests</dt>
                        <dd className="num">
                          {template.guests.reduce((s, g) => s + g[2], 0)} guests
                        </dd>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wallet className="h-3 w-3" aria-hidden />
                        <dt className="sr-only">Starter budget</dt>
                        <dd className="num">
                          {formatMoney(template.profile.totalBudget, template.profile.currency, true)}
                        </dd>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ListChecks className="h-3 w-3" aria-hidden />
                        <dt className="sr-only">Starter tasks</dt>
                        <dd className="num">{template.tasks.length} tasks</dd>
                      </div>
                    </dl>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-center text-xs text-[var(--ink-faint)]">
            Each occasion starts from a realistic sample plan you can edit or clear. Nothing is
            sent anywhere — your plan lives in this browser.
          </p>
        </section>
      </main>
    </div>
  );
}
