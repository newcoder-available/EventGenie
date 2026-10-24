"use client";

import Link from "next/link";
import { ArrowUpRight, ListChecks, Store, Users, Wallet } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import {
  budgetSummary,
  formatMoney,
  guestSummary,
  overallProgress,
  vendorSummary,
} from "@/lib/calculations";
import { Progress } from "@/components/ui";

/**
 * The four numbers that answer "where are we". Each is derived from the same
 * state the detail pages edit, so they cannot disagree with the tables below.
 */
export function KpiCards() {
  const { state } = useEvent();
  const progress = overallProgress(state);
  const budget = budgetSummary(state);
  const guests = guestSummary(state);
  const vendors = vendorSummary(state);
  const { currency } = state.profile;

  const cards = [
    {
      href: "/checklist",
      icon: ListChecks,
      label: "Planning progress",
      value: `${progress.percent}%`,
      bar: progress.percent,
      tone: "primary" as const,
      footnote: `${progress.tasks.done} of ${progress.tasks.total} tasks done`,
      flag:
        progress.tasks.overdue > 0
          ? { text: `${progress.tasks.overdue} overdue`, tone: "danger" as const }
          : null,
    },
    {
      href: "/budget",
      icon: Wallet,
      label: "Budget committed",
      value: formatMoney(budget.committed, currency, true),
      bar: Math.min(100, budget.utilisation),
      tone: budget.overBudget ? ("danger" as const) : ("gold" as const),
      footnote: `${formatMoney(Math.abs(budget.remaining), currency, true)} ${
        budget.overBudget ? "over" : "left"
      } of ${formatMoney(budget.total, currency, true)}`,
      flag: budget.overBudget
        ? { text: "over budget", tone: "danger" as const }
        : { text: `${budget.utilisation.toFixed(0)}% used`, tone: "neutral" as const },
    },
    {
      href: "/guests",
      icon: Users,
      label: "Guests confirmed",
      value: `${guests.accepted}`,
      bar: guests.invited > 0 ? (guests.accepted / guests.invited) * 100 : 0,
      tone: "success" as const,
      footnote: `${guests.invited} invited · ${guests.pending} awaiting reply`,
      flag:
        guests.pending > 0
          ? { text: `${guests.pending} pending`, tone: "warning" as const }
          : { text: "all replied", tone: "neutral" as const },
    },
    {
      href: "/vendors",
      icon: Store,
      label: "Vendors booked",
      value: `${vendors.booked} / ${vendors.total}`,
      bar: vendors.percent,
      tone: "primary" as const,
      footnote: `${vendors.outstanding} still to lock in`,
      flag:
        vendors.contacted > 0
          ? { text: `${vendors.contacted} in progress`, tone: "neutral" as const }
          : null,
    },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => (
        <Link
          key={c.label}
          href={c.href}
          className="eg-card eg-rise group p-4 transition-shadow hover:shadow-[var(--shadow-lg)]"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-tint)] text-[var(--primary)]">
              <c.icon className="h-[1.05rem] w-[1.05rem]" aria-hidden />
            </span>
            <ArrowUpRight
              className="h-4 w-4 text-[var(--ink-faint)] opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </div>

          <p className="eg-label">{c.label}</p>
          <p className="num mt-1 font-display text-2xl text-[var(--ink)]">{c.value}</p>

          <Progress value={c.bar} tone={c.tone} className="mt-3" label={`${c.label}: ${c.bar.toFixed(0)}%`} />

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <p className="truncate text-xs text-[var(--ink-muted)]">{c.footnote}</p>
            {c.flag && (
              <span
                className="shrink-0 text-xs font-medium"
                style={{
                  color:
                    c.flag.tone === "danger"
                      ? "var(--danger)"
                      : c.flag.tone === "warning"
                        ? "var(--warning)"
                        : "var(--ink-faint)",
                }}
              >
                {c.flag.text}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
