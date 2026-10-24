"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { formatDate, formatMoney } from "@/lib/calculations";
import type { Expense } from "@/types/event";
import { Badge, Button, EmptyState } from "@/components/ui";
import { CATEGORY_COLOR } from "./BudgetDonut";
import { Wallet } from "lucide-react";

/**
 * The expense ledger. Overspend is flagged with a word and an amount, not a
 * red wash — a budget that is 4% over should read as information, not alarm.
 */
export function ExpenseTable({
  expenses,
  currency,
  onEdit,
  compact = false,
}: {
  expenses: Expense[];
  currency: string;
  onEdit: (expense: Expense) => void;
  compact?: boolean;
}) {
  const { dispatch } = useEvent();
  const { toast } = useToast();

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No expenses here yet"
        detail="Add your first line and the ring and the summary update straight away."
      />
    );
  }

  function remove(expense: Expense) {
    dispatch({ type: "expense/delete", id: expense.id });
    toast("Expense removed", { detail: expense.label, tone: "info" });
  }

  return (
    <div className="eg-scroll -mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[42rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-left">
            <th className="eg-label py-2 pr-3 font-semibold">Item</th>
            <th className="eg-label py-2 pr-3 text-right font-semibold">Estimated</th>
            <th className="eg-label py-2 pr-3 text-right font-semibold">Actual</th>
            <th className="eg-label py-2 pr-3 text-right font-semibold">Difference</th>
            <th className="eg-label py-2 pr-3 font-semibold">Status</th>
            <th className="eg-label py-2 text-right font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => {
            const paid = e.actual > 0;
            const diff = paid ? e.actual - e.estimated : 0;
            return (
              <tr
                key={e.id}
                className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-sunken)]/60"
              >
                <td className="py-2.5 pr-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-[3px]"
                      style={{ background: CATEGORY_COLOR[e.category] }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[var(--ink)]">{e.label}</p>
                      <p className="truncate text-xs text-[var(--ink-faint)]">
                        {e.category}
                        {paid && ` · paid ${formatDate(e.paidOn)}`}
                        {!compact && e.note ? ` · ${e.note}` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="num py-2.5 pr-3 text-right text-[var(--ink-muted)]">
                  {formatMoney(e.estimated, currency)}
                </td>
                <td className="num py-2.5 pr-3 text-right text-[var(--ink)]">
                  {paid ? formatMoney(e.actual, currency) : "—"}
                </td>
                <td
                  className="num py-2.5 pr-3 text-right"
                  style={{
                    color:
                      diff > 0
                        ? "var(--warning)"
                        : diff < 0
                          ? "var(--success)"
                          : "var(--ink-faint)",
                  }}
                >
                  {diff === 0 ? "—" : `${diff > 0 ? "+" : "−"}${formatMoney(Math.abs(diff), currency)}`}
                </td>
                <td className="py-2.5 pr-3">
                  {!paid ? (
                    <Badge tone="neutral">Planned</Badge>
                  ) : diff > 0 ? (
                    <Badge tone="warning">Over estimate</Badge>
                  ) : diff < 0 ? (
                    <Badge tone="success">Under</Badge>
                  ) : (
                    <Badge tone="success">On estimate</Badge>
                  )}
                </td>
                <td className="py-2.5">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${e.label}`}
                      onClick={() => onEdit(e)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${e.label}`}
                      onClick={() => remove(e)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
