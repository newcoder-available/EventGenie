"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { BudgetCategory } from "@/types/event";
import type { CategoryRollup } from "@/lib/calculations";
import { formatMoney } from "@/lib/calculations";

/**
 * Budget composition.
 *
 * Colour is categorical: one fixed hue per spend category, assigned by the
 * category's own position so a filter can never repaint the survivors. The
 * eight hues were validated against this ivory surface for contrast and
 * colourblind separation; "Miscellaneous" is the catch-all and takes the
 * neutral, which is also why it never competes with a real category.
 *
 * A ring is a weaker way to compare nine magnitudes than a bar is, so the
 * ring answers "what is the shape of this budget" and the table beside it
 * answers "which line is bigger" — every value is also written down.
 */

export const CATEGORY_COLOR: Record<BudgetCategory, string> = {
  Venue: "var(--series-1)",
  Catering: "var(--series-2)",
  Decoration: "var(--series-3)",
  Photography: "var(--series-4)",
  Entertainment: "var(--series-5)",
  "Attire & Styling": "var(--series-6)",
  "Logistics & Travel": "var(--series-7)",
  "Gifts & Stationery": "var(--series-8)",
  // The catch-all takes the neutral, so it never competes with a real line.
  Miscellaneous: "var(--series-other)",
};

type Props = {
  rows: CategoryRollup[];
  currency: string;
  /** Printed in the middle of the ring. */
  centreValue: number;
  centreLabel: string;
};

export function BudgetDonut({ rows, currency, centreValue, centreLabel }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const data = rows.map((r) => ({ name: r.category, value: r.committed, share: r.share }));
  const hovered = active !== null ? rows[active] : null;

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-[var(--ink-muted)]">
        Add an expense to see the split.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={104}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              stroke="var(--surface)"
              strokeWidth={2}
              isAnimationActive={false}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {/* Recharts 3 dropped activeIndex/activeShape on Pie, so the
                  hover highlight is done by dimming the other slices. */}
              {data.map((d, i) => (
                <Cell
                  key={d.name}
                  fill={CATEGORY_COLOR[d.name as BudgetCategory]}
                  fillOpacity={active === null || active === i ? 1 : 0.38}
                  style={{ outline: "none" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* The hero number lives in the hole, and becomes the hovered slice. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {hovered ? (
          <>
            <span className="max-w-[8rem] truncate text-xs font-medium text-[var(--ink-muted)]">
              {hovered.category}
            </span>
            <span className="num font-display text-xl text-[var(--ink)]">
              {formatMoney(hovered.committed, currency, true)}
            </span>
            <span className="num text-xs text-[var(--ink-faint)]">
              {hovered.share.toFixed(1)}% of committed
            </span>
          </>
        ) : (
          <>
            <span className="eg-label">{centreLabel}</span>
            <span className="num font-display text-2xl text-[var(--ink)]">
              {formatMoney(centreValue, currency, true)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/** Identity never rests on colour alone: the legend names every slice. */
export function BudgetLegend({
  rows,
  currency,
  onSelect,
}: {
  rows: CategoryRollup[];
  currency: string;
  onSelect?: (category: BudgetCategory) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
      {rows.map((r) => (
        <li key={r.category}>
          <button
            type="button"
            onClick={() => onSelect?.(r.category)}
            disabled={!onSelect}
            className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors enabled:hover:bg-[var(--surface-sunken)]"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ background: CATEGORY_COLOR[r.category] }}
            />
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--ink)]">{r.category}</span>
            <span className="num shrink-0 text-sm text-[var(--ink-muted)]">
              {formatMoney(r.committed, currency, true)}
            </span>
            <span className="num w-11 shrink-0 text-right text-xs text-[var(--ink-faint)]">
              {r.share.toFixed(0)}%
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
