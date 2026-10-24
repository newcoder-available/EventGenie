"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CalendarHeart,
  Image as ImageIcon,
  ListChecks,
  Plus,
  Sparkles,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { themeFor } from "@/lib/eventThemes";
import { formatMoney } from "@/lib/calculations";
import type { Expense, Task } from "@/types/event";
import { Button, Card, CardHeader, Progress } from "@/components/ui";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { ProfileDialog } from "@/components/dashboard/ProfileDialog";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { Confetti } from "@/components/ui/EventOrnaments";
import { BudgetDonut, BudgetLegend } from "@/components/budget/BudgetDonut";
import { ExpenseDialog } from "@/components/budget/ExpenseDialog";
import { ExpenseTable } from "@/components/budget/ExpenseTable";
import { TaskDialog } from "@/components/checklist/TaskDialog";
import { TaskList, TaskFilterBar, type TaskFilter } from "@/components/checklist/TaskList";
import { MilestoneTimeline } from "@/components/timeline/MilestoneTimeline";
import { VendorCard } from "@/components/vendors/VendorCard";
import { GuestTable, RsvpSummary } from "@/components/guests/GuestTable";
import { InspirationGrid } from "@/components/inspiration/InspirationGrid";
import { RunSheet } from "@/components/schedule/RunSheet";

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}

export default function OverviewPage() {
  const { state, summary } = useEvent();
  const router = useRouter();
  const nouns = themeFor(state.profile.eventType).nouns;
  const [celebrate, setCelebrate] = useState(0);

  // Mark the arrival once per browser session, not on every visit back.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("eventgenie.greeted")) return;
      sessionStorage.setItem("eventgenie.greeted", "1");
    } catch {
      /* private mode: just skip the flourish */
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- session storage cannot be read during render.
    setCelebrate(1);
  }, []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("Pending");

  const { budget, categories: rows } = summary;
  const { currency } = state.profile;

  const taskCounts: Record<TaskFilter, number> = {
    All: summary.tasks.total,
    Pending: summary.tasks.pending,
    Completed: summary.tasks.done,
    Overdue: summary.tasks.overdue,
  };

  const recentExpenses = [...state.expenses]
    .sort((a, b) => (b.paidOn || "").localeCompare(a.paidOn || ""))
    .slice(0, 5);

  return (
    <>
      <Confetti run={celebrate} />
      <WelcomeHero onEdit={() => setProfileOpen(true)} />
      <KpiCards />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        {/* Budget */}
        <Card className="p-5">
          <CardHeader
            icon={Wallet}
            title="Budget overview"
            subtitle={`${formatMoney(budget.committed, currency)} committed of ${formatMoney(budget.total, currency)}`}
            action={
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingExpense(null);
                    setExpenseOpen(true);
                  }}
                >
                  <Plus />
                  Add expense
                </Button>
                <ViewAll href="/budget" label="Full budget" />
              </>
            }
          />

          <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,15rem)_1fr]">
            <BudgetDonut
              rows={rows}
              currency={currency}
              centreValue={budget.committed}
              centreLabel="Committed"
            />
            <div className="flex flex-col justify-center gap-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Estimated", value: budget.estimated },
                  { label: "Paid", value: budget.actual },
                  { label: budget.overBudget ? "Over" : "Remaining", value: Math.abs(budget.remaining) },
                ].map((s, i) => (
                  <div key={s.label}>
                    <p className="eg-label">{s.label}</p>
                    <p
                      className="num mt-0.5 font-display text-lg"
                      style={{
                        color: i === 2 && budget.overBudget ? "var(--danger)" : "var(--ink)",
                      }}
                    >
                      {formatMoney(s.value, currency, true)}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-[var(--ink-muted)]">Budget used</span>
                  <span className="num font-medium text-[var(--ink)]">
                    {budget.utilisation.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={budget.utilisation}
                  tone={budget.overBudget ? "danger" : "gold"}
                  label="Budget used"
                />
              </div>
              <BudgetLegend rows={rows} currency={currency} />
            </div>
          </div>

          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <p className="eg-label mb-2">Latest activity</p>
            <ExpenseTable
              expenses={recentExpenses}
              currency={currency}
              compact
              onEdit={(e) => {
                setEditingExpense(e);
                setExpenseOpen(true);
              }}
            />
          </div>
        </Card>

        {/* Tasks */}
        <Card className="flex flex-col p-5">
          <CardHeader
            icon={ListChecks}
            title="Upcoming tasks"
            subtitle={`${taskCounts.Pending} still to do`}
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingTask(null);
                  setTaskOpen(true);
                }}
              >
                <Plus />
                Add
              </Button>
            }
          />
          <div className="mt-4">
            <TaskFilterBar value={taskFilter} onChange={setTaskFilter} counts={taskCounts} />
          </div>
          <div className="mt-2 flex-1">
            <TaskList
              filter={taskFilter}
              limit={6}
              onEdit={(t) => {
                setEditingTask(t);
                setTaskOpen(true);
              }}
              onAdd={() => {
                setEditingTask(null);
                setTaskOpen(true);
              }}
            />
          </div>
          <div className="mt-3 border-t border-[var(--line)] pt-3">
            <ViewAll href="/checklist" label="View all tasks" />
          </div>
        </Card>
      </div>

      {/* Timeline + guests */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <CardHeader
            icon={CalendarClock}
            title="Planning timeline"
            subtitle="Counted back from your date"
            action={<ViewAll href="/timeline" label="Full timeline" />}
          />
          <div className="mt-4">
            <MilestoneTimeline limit={5} />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader
            icon={Users}
            title="Guests & RSVP"
            subtitle="Head counts, not households"
            action={<ViewAll href="/guests" label="Manage guests" />}
          />
          <div className="mt-4">
            <RsvpSummary />
          </div>
          <div className="mt-4">
            <GuestTable limit={5} onEdit={() => {}} />
          </div>
        </Card>
      </div>

      {/* Vendors */}
      <Card className="mt-4 p-5">
        <CardHeader
          icon={Store}
          title="Vendors"
          subtitle="Sample directory — mark them as you contact and book"
          action={<ViewAll href="/vendors" label="All vendors" />}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.vendors.slice(0, 3).map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      </Card>

      {/* Inspiration + schedule */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card className="p-5">
          <CardHeader
            icon={ImageIcon}
            title="Inspiration board"
            subtitle={`${state.inspiration.filter((i) => i.favorite).length} saved`}
            action={<ViewAll href="/inspiration" label="Open board" />}
          />
          <div className="mt-4">
            <InspirationGrid limit={3} />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader
            icon={CalendarHeart}
            title={nouns.dayName}
            subtitle="The first few hours"
            action={<ViewAll href="/schedule" label="Full run sheet" />}
          />
          <div className="mt-2">
            <RunSheet limit={5} />
          </div>
        </Card>
      </div>

      {/* Assistant teaser */}
      <Card className="eg-hero mt-4 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-lg text-[var(--ink)]">
              Stuck on something? Ask the planner.
            </h2>
            <p className="mt-0.5 max-w-xl text-sm text-[var(--ink-muted)]">
              It can see your budget, checklist and vendors — and it can write a checklist, a budget
              split or a set of ideas straight into this dashboard.
            </p>
          </div>
        </div>
        <Button onClick={() => router.push("/assistant")}>
          <Sparkles />
          Open the assistant
        </Button>
      </Card>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} editing={editingExpense} />
      <TaskDialog open={taskOpen} onOpenChange={setTaskOpen} editing={editingTask} />
    </>
  );
}
