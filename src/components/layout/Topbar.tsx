"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarHeart,
  ListChecks,
  Menu,
  Search,
  Sparkles,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { countdown, formatDate, isOverdue } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { themeFor } from "@/lib/eventThemes";
import { Button } from "@/components/ui";
import { pageTitles } from "./nav";

type Hit = { href: string; label: string; detail: string; icon: React.ComponentType<{ className?: string }> };

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useEvent();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const nouns = themeFor(state.profile.eventType).nouns;
  const title = pageTitles(nouns)[pathname] ?? "Overview";
  const cd = countdown(state.profile.eventDate);

  /* Search across everything the couple has entered. */
  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: Hit[] = [];
    for (const g of state.guests) {
      if (g.name.toLowerCase().includes(q))
        out.push({ href: "/guests", label: g.name, detail: `Guest · ${g.rsvp}`, icon: Users });
    }
    for (const v of state.vendors) {
      if (v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q))
        out.push({ href: "/vendors", label: v.name, detail: `Vendor · ${v.category}`, icon: Store });
    }
    for (const t of state.tasks) {
      if (t.title.toLowerCase().includes(q))
        out.push({ href: "/checklist", label: t.title, detail: `Task · ${t.category}`, icon: ListChecks });
    }
    for (const e of state.expenses) {
      if (e.label.toLowerCase().includes(q))
        out.push({ href: "/budget", label: e.label, detail: `Expense · ${e.category}`, icon: Wallet });
    }
    for (const s of state.schedule) {
      if (s.title.toLowerCase().includes(q))
        out.push({ href: "/schedule", label: s.title, detail: `Schedule · ${s.time}`, icon: CalendarHeart });
    }
    return out.slice(0, 8);
  }, [query, state]);

  /* Notifications are derived, not stored: overdue tasks and silent RSVPs. */
  const notifications = useMemo(() => {
    const items: { id: string; text: string; href: string; tone: "warning" | "danger" | "neutral" }[] = [];
    for (const t of state.tasks) {
      if (isOverdue(t.dueDate, t.done)) {
        items.push({
          id: t.id,
          text: `"${t.title}" was due ${formatDate(t.dueDate)}`,
          href: "/checklist",
          tone: "danger",
        });
      }
    }
    const pending = state.guests.filter((g) => g.rsvp === "pending").length;
    if (pending > 0) {
      items.push({
        id: "rsvp",
        text: `${pending} households have not replied yet`,
        href: "/guests",
        tone: "warning",
      });
    }
    const unbooked = state.vendors.filter((v) => v.status === "not contacted").length;
    if (unbooked > 0) {
      items.push({
        id: "vendors",
        text: `${unbooked} vendors still to contact`,
        href: "/vendors",
        tone: "neutral",
      });
    }
    return items.slice(0, 6);
  }, [state]);

  // Close the popovers on an outside click or Escape.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotificationsOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--canvas)_88%,transparent)] backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="lg:hidden"
        >
          <Menu />
        </Button>

        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="flex items-baseline gap-2">
            <span className="hidden text-xs text-[var(--ink-faint)] sm:inline">EventGenie</span>
            <span aria-hidden className="hidden text-xs text-[var(--ink-faint)] sm:inline">
              /
            </span>
            <h1 className="truncate font-display text-base text-[var(--ink)] sm:text-lg">{title}</h1>
          </nav>
        </div>

        {/* Countdown — the number that reframes every other number. */}
        <Link
          href="/my-event"
          className="hidden items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold-tint)] px-3 py-1.5 text-xs text-[#7a5e1e] transition-colors hover:border-[var(--gold)] md:flex"
        >
          <CalendarHeart className="h-3.5 w-3.5" aria-hidden />
          <span className="num font-semibold">{cd.totalDays}</span>
          <span>days to go</span>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative">
          <label htmlFor="global-search" className="sr-only">
            Search your plan
          </label>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
            aria-hidden
          />
          <input
            id="global-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search"
            autoComplete="off"
            className="w-28 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] py-2 pl-8 pr-3 text-sm outline-none transition-[width,border-color] focus:w-44 focus:border-[var(--primary)] sm:w-40 sm:focus:w-64"
          />
          {open && query.trim().length >= 2 && (
            <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
              {hits.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-[var(--ink-muted)]">
                  Nothing matches “{query.trim()}”.
                </p>
              ) : (
                <ul className="max-h-80 overflow-y-auto py-1">
                  {hits.map((hit, i) => (
                    <li key={`${hit.href}-${i}`}>
                      <button
                        onClick={() => {
                          router.push(hit.href);
                          setOpen(false);
                          setQuery("");
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--surface-sunken)]"
                      >
                        <hit.icon className="h-4 w-4 shrink-0 text-[var(--ink-faint)]" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-[var(--ink)]">{hit.label}</span>
                          <span className="block truncate text-xs text-[var(--ink-faint)]">
                            {hit.detail}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Notifications, ${notifications.length} items`}
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((v) => !v)}
            className="relative"
          >
            <Bell />
            {notifications.length > 0 && (
              <span
                aria-hidden
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-[var(--canvas)] bg-[var(--danger)]"
              />
            )}
          </Button>
          {notificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
              <p className="border-b border-[var(--line)] px-4 py-2.5 text-sm font-medium text-[var(--ink)]">
                Needs attention
              </p>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-[var(--ink-muted)]">
                  Nothing is overdue. Enjoy it.
                </p>
              ) : (
                <ul className="max-h-80 overflow-y-auto py-1">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={n.href}
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-[var(--surface-sunken)]"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                            n.tone === "danger"
                              ? "bg-[var(--danger)]"
                              : n.tone === "warning"
                                ? "bg-[var(--warning)]"
                                : "bg-[var(--ink-faint)]",
                          )}
                        />
                        <span className="text-sm text-[var(--ink-muted)]">{n.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="primary"
          className="hidden sm:inline-flex"
          onClick={() => router.push("/assistant")}
        >
          <Sparkles />
          Ask AI
        </Button>
        <Button
          variant="primary"
          size="icon"
          aria-label="Ask the AI planning assistant"
          onClick={() => router.push("/assistant")}
          className="sm:hidden"
        >
          <Sparkles />
        </Button>
      </div>
    </header>
  );
}
