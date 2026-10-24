"use client";

import { useMemo, useState } from "react";
import { Plus, Settings2, Wallet } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { budgetByCategory, budgetSummary, formatMoney } from "@/lib/calculations";
import type { BudgetCategory, Expense } from "@/types/event";
import { BUDGET_CATEGORIES } from "@/types/event";
import { Badge, Button, Card, CardHeader, PageHeading, Progress, Select } from "@/components/ui";
import { BudgetDonut, BudgetLegend, CATEGORY_COLOR } from "@/components/budget/BudgetDonut";
import { ExpenseDialog } from "@/components/budget/ExpenseDialog";
import { ExpenseTable } from "@/components/budget/ExpenseTable";
import { ProfileDialog } from "@/components/dashboard/ProfileDialog";

export default function BudgetPage() {
  const { state } = useEvent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<"All" | BudgetCategory>("All");

  const budget = budgetSummary(state);
  const rows = budgetByCategory(state);
  const { currency } = state.profile;

  const visible = useMemo(
    () =>
      state.expenses
        .filter((e) => filter === "All" || e.category === filter)
        .sort((a, b) => b.estimated - a.estimated),
    [state.expenses, filter],
  );

  function add() {
    setEditing(null);
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeading
        title="Budget planner"
        subtitle={`${formatMoney(budget.committed, currency)} committed of ${formatMoney(budget.total, currency)} · ${state.expenses.length} lines`}
        action={
          <>
            <Button variant="secondary" onClick={() => setProfileOpen(true)}>
              <Settings2 />
              Edit budget
            </Button>
            <Button onClick={add}>
              <Plus />
              Add expense
            </Button>
          </>
        }
      />

      {budget.overBudget && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-tint)] px-4 py-3">
          <Badge tone="warning">Over budget</Badge>
          <p className="text-sm text-[var(--ink)]">
            Committed spend is {formatMoney(Math.abs(budget.remaining), currency)} above the total.
            Either raise the budget or take it out of the two largest lines.
          </p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <Card className="p-5">
          <CardHeader icon={Wallet} title="Where the money goes" />
          <div className="mt-4">
            <BudgetDonut
              rows={rows}
              currency={currency}
              centreValue={budget.committed}
              centreLabel="Committed"
            />
          </div>
          <div className="mt-4 border-t border-[var(--line)] pt-4">
            <BudgetLegend
              rows={rows}
              currency={currency}
              onSelect={(c) => setFilter((f) => (f === c ? "All" : c))}
            />
            <p className="mt-3 text-xs text-[var(--ink-faint)]">
              Click a category to filter the table below.
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Total budget", value: budget.total, tone: "var(--ink)" },
                { label: "Estimated", value: budget.estimated, tone: "var(--ink)" },
                { label: "Actually paid", value: budget.actual, tone: "var(--success)" },
                {
                  label: budget.overBudget ? "Over by" : "Remaining",
                  value: Math.abs(budget.remaining),
                  tone: budget.overBudget ? "var(--danger)" : "var(--gold)",
                },
              ].map((s) => (
                <div key={s.label}>
                  <p className="eg-label">{s.label}</p>
                  <p className="num mt-1 font-display text-xl" style={{ color: s.tone }}>
                    {formatMoney(s.value, currency, true)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-[var(--ink-muted)]">
                  {budget.utilisation.toFixed(0)}% of the budget is committed
                </span>
                <span className="num text-[var(--ink-faint)]">
                  {budget.spentPercent.toFixed(0)}% actually paid
                </span>
              </div>
              <Progress
                value={budget.utilisation}
                tone={budget.overBudget ? "danger" : "gold"}
                label="Budget committed"
              />
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader
              title="Category rollup"
              subtitle="Estimated against what has actually been paid"
            />
            <div className="eg-scroll mt-4 -mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left">
                    <th className="eg-label py-2 pr-3 font-semibold">Category</th>
                    <th className="eg-label py-2 pr-3 text-right font-semibold">Estimated</th>
                    <th className="eg-label py-2 pr-3 text-right font-semibold">Actual</th>
                    <th className="eg-label py-2 text-right font-semibold">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.category} className="border-b border-[var(--line)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="h-2.5 w-2.5 rounded-[3px]"
                            style={{ background: CATEGORY_COLOR[r.category] }}
                          />
                          {r.category}
                        </span>
                      </td>
                      <td className="num py-2 pr-3 text-right text-[var(--ink-muted)]">
                        {formatMoney(r.estimated, currency, true)}
                      </td>
                      <td className="num py-2 pr-3 text-right">
                        {r.actual > 0 ? formatMoney(r.actual, currency, true) : "—"}
                      </td>
                      <td className="num py-2 text-right text-[var(--ink-faint)]">
                        {r.share.toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-4 p-5">
        <CardHeader
          title="Expense history"
          subtitle={`${visible.length} ${filter === "All" ? "lines" : `lines in ${filter}`}`}
          action={
            <>
              <label htmlFor="budget-filter" className="sr-only">
                Filter by category
              </label>
              <Select
                id="budget-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="w-auto"
              >
                <option value="All">All categories</option>
                {BUDGET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Button size="sm" onClick={add}>
                <Plus />
                Add
              </Button>
            </>
          }
        />
        <div className="mt-4">
          <ExpenseTable
            expenses={visible}
            currency={currency}
            onEdit={(e) => {
              setEditing(e);
              setDialogOpen(true);
            }}
          />
        </div>
      </Card>

      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
