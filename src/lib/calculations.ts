import { BUDGET_CATEGORIES, type BudgetCategory, type EventState } from "@/types/event";

/**
 * Every number the dashboard shows is derived here, from one state object.
 * No panel keeps its own copy of a total — that is how KPI cards drift away
 * from the tables they summarise.
 */

const DAY = 86_400_000;

export function parseDate(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

export function daysUntil(iso: string, now = Date.now()): number {
  return Math.ceil((parseDate(iso) - now) / DAY);
}

export function countdown(iso: string, now = Date.now()) {
  const totalDays = Math.max(0, daysUntil(iso, now));
  return {
    totalDays,
    months: Math.floor(totalDays / 30),
    weeks: Math.floor((totalDays % 30) / 7),
    days: totalDays % 7,
    past: parseDate(iso) < now,
  };
}

/** Milestone dates are derived from the wedding date, never stored. */
export function milestoneDate(eventDate: string, monthsBefore: number): number {
  return parseDate(eventDate) - monthsBefore * 30 * DAY;
}

export function formatMoney(amount: number, currency: string, compact = false): string {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: compact && Math.abs(amount) >= 100_000 ? "compact" : "standard",
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!iso) return "—";
  const ms = parseDate(iso);
  if (Number.isNaN(ms)) return "—";
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...opts,
  });
}

/* ------------------------------- budget ------------------------------- */

export type CategoryRollup = {
  category: BudgetCategory;
  estimated: number;
  actual: number;
  /** Positive means over the estimate. */
  difference: number;
  /** What this category contributes to the committed total. */
  committed: number;
  share: number;
  count: number;
};

export function budgetSummary(state: EventState) {
  const estimated = state.expenses.reduce((s, e) => s + e.estimated, 0);
  const actual = state.expenses.reduce((s, e) => s + e.actual, 0);
  // A line that has not been paid still commits its estimate.
  const committed = state.expenses.reduce((s, e) => s + (e.actual > 0 ? e.actual : e.estimated), 0);
  const total = state.profile.totalBudget;

  return {
    total,
    estimated,
    actual,
    committed,
    remaining: total - committed,
    spentRemaining: total - actual,
    utilisation: total > 0 ? Math.min(999, (committed / total) * 100) : 0,
    spentPercent: total > 0 ? Math.min(999, (actual / total) * 100) : 0,
    overBudget: committed > total,
    variance: actual - estimated,
  };
}

export function budgetByCategory(state: EventState): CategoryRollup[] {
  const committedTotal = state.expenses.reduce(
    (s, e) => s + (e.actual > 0 ? e.actual : e.estimated),
    0,
  );

  return BUDGET_CATEGORIES.map((category) => {
    const lines = state.expenses.filter((e) => e.category === category);
    const estimated = lines.reduce((s, e) => s + e.estimated, 0);
    const actual = lines.reduce((s, e) => s + e.actual, 0);
    const committed = lines.reduce((s, e) => s + (e.actual > 0 ? e.actual : e.estimated), 0);
    return {
      category,
      estimated,
      actual,
      committed,
      difference: actual > 0 ? actual - estimated : 0,
      share: committedTotal > 0 ? (committed / committedTotal) * 100 : 0,
      count: lines.length,
    };
  }).filter((r) => r.count > 0);
}

/* -------------------------------- tasks -------------------------------- */

export function taskSummary(state: EventState, now = Date.now()) {
  const total = state.tasks.length;
  const done = state.tasks.filter((t) => t.done).length;
  const overdue = state.tasks.filter((t) => !t.done && parseDate(t.dueDate) < now).length;
  return {
    total,
    done,
    pending: total - done,
    overdue,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

export function isOverdue(iso: string, done: boolean, now = Date.now()): boolean {
  return !done && parseDate(iso) < now;
}

/* -------------------------------- guests ------------------------------- */

export function guestSummary(state: EventState) {
  const heads = (f: (g: (typeof state.guests)[number]) => boolean) =>
    state.guests.filter(f).reduce((s, g) => s + g.partySize, 0);

  return {
    households: state.guests.length,
    invited: heads(() => true),
    accepted: heads((g) => g.rsvp === "accepted"),
    declined: heads((g) => g.rsvp === "declined"),
    pending: heads((g) => g.rsvp === "pending"),
    responseRate:
      state.guests.length > 0
        ? Math.round(
            (state.guests.filter((g) => g.rsvp !== "pending").length / state.guests.length) * 100,
          )
        : 0,
  };
}

/* ------------------------------- vendors ------------------------------- */

export function vendorSummary(state: EventState) {
  const booked = state.vendors.filter((v) => v.status === "booked").length;
  const contacted = state.vendors.filter(
    (v) => v.status === "contacted" || v.status === "shortlisted",
  ).length;
  return {
    total: state.vendors.length,
    booked,
    contacted,
    outstanding: state.vendors.length - booked,
    percent: state.vendors.length > 0 ? Math.round((booked / state.vendors.length) * 100) : 0,
  };
}

/* ------------------------------ milestones ----------------------------- */

export type MilestoneStatus = "done" | "overdue" | "active" | "upcoming";

export function milestoneStatus(
  eventDate: string,
  monthsBefore: number,
  done: boolean,
  now = Date.now(),
): MilestoneStatus {
  if (done) return "done";
  const due = milestoneDate(eventDate, monthsBefore);
  if (due < now) return "overdue";
  // "Active" is the window you should be working in right now.
  if (due - now < 45 * DAY) return "active";
  return "upcoming";
}

/* ------------------------------- schedule ------------------------------ */

export function endTime(time: string, durationMinutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Overall planning progress, weighting the things that actually block a wedding. */
export function overallProgress(state: EventState) {
  const tasks = taskSummary(state);
  const vendors = vendorSummary(state);
  const guests = guestSummary(state);
  const milestonesDone = state.milestones.filter((m) => m.done).length;
  const milestonePercent =
    state.milestones.length > 0 ? (milestonesDone / state.milestones.length) * 100 : 0;

  const percent = Math.round(
    tasks.percent * 0.4 + vendors.percent * 0.3 + guests.responseRate * 0.15 + milestonePercent * 0.15,
  );

  return { percent: Math.min(100, percent), tasks, vendors, guests, milestonePercent };
}
