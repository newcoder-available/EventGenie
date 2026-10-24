import type {
  BudgetCategory,
  EventProfile,
  EventState,
  EventType,
  Guest,
  InspirationCategory,
  MealPreference,
  Priority,
  RsvpStatus,
  TaskCategory,
  VendorCategory,
} from "@/types/event";

/**
 * One template per occasion.
 *
 * Budget lines carry a *share* rather than an amount, so a template stays
 * correct when someone changes the total — the builder resolves shares
 * against the budget and pushes rounding drift into the largest line, which
 * is what keeps the ledger summing exactly.
 */

export type TemplateBudgetLine = {
  category: BudgetCategory;
  label: string;
  /** Fraction of the allocatable budget (total minus contingency). */
  share: number;
  /** When set, the line is already paid at this multiple of its estimate. */
  paidAt?: number;
  paidDaysAgo?: number;
  note?: string;
};

export type TemplateTask = {
  title: string;
  category: TaskCategory;
  dueInDays: number;
  priority: Priority;
  owner: string;
  done?: boolean;
};

export type TemplateMilestone = {
  title: string;
  detail: string;
  monthsBefore: number;
  done?: boolean;
};

export type TemplateGuest = [
  name: string,
  side: string,
  partySize: number,
  rsvp: RsvpStatus,
  meal: MealPreference,
  table: string,
];

export type TemplateVendor = {
  name: string;
  category: VendorCategory;
  priceFrom: number;
  priceTo: number;
  rating: number;
  reviewCount: number;
  status: "not contacted" | "contacted" | "shortlisted" | "booked";
  description: string;
};

export type TemplateIdea = {
  title: string;
  category: InspirationCategory;
  note: string;
  favorite?: boolean;
  palette: [string, string];
};

export type TemplateSlot = {
  time: string;
  mins: number;
  title: string;
  detail: string;
  owner: string;
};

export type EventTemplate = {
  profile: Omit<EventProfile, "eventType" | "eventDate">;
  /** Days from today the demo event sits. */
  daysOut: number;
  /** Held back from the category split, as a percentage. */
  contingencyPercent: number;
  budget: TemplateBudgetLine[];
  tasks: TemplateTask[];
  milestones: TemplateMilestone[];
  guests: TemplateGuest[];
  vendors: TemplateVendor[];
  inspiration: TemplateIdea[];
  schedule: TemplateSlot[];
};

const DAY = 86_400_000;

function isoIn(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString().slice(0, 10);
}

/** Resolve a template into a live state object. */
export function buildState(eventType: EventType, template: EventTemplate): EventState {
  const { profile, budget, contingencyPercent } = template;
  const allocatable = Math.round(profile.totalBudget * (1 - contingencyPercent / 100));

  const shareTotal = budget.reduce((s, b) => s + b.share, 0) || 1;
  let expenses = budget.map((line, i) => {
    const estimated = Math.round((allocatable * line.share) / shareTotal);
    const actual = line.paidAt ? Math.round(estimated * line.paidAt) : 0;
    return {
      id: `e${i + 1}`,
      category: line.category,
      label: line.label,
      estimated,
      actual,
      paidOn: line.paidAt ? isoIn(-(line.paidDaysAgo ?? 30)) : "",
      note: line.note,
    };
  });

  // Push rounding drift into the largest estimate so the column sums exactly.
  const drift = allocatable - expenses.reduce((s, e) => s + e.estimated, 0);
  if (drift !== 0 && expenses.length) {
    const biggest = expenses.reduce((a, b) => (b.estimated > a.estimated ? b : a));
    expenses = expenses.map((e) =>
      e.id === biggest.id ? { ...e, estimated: e.estimated + drift } : e,
    );
  }

  const guests: Guest[] = template.guests.map(([name, side, partySize, rsvp, meal, table], i) => ({
    id: `g${i + 1}`,
    name,
    side,
    partySize,
    rsvp,
    meal,
    table,
  }));

  const vendors = template.vendors.map((v, i) => ({ ...v, id: `v${i + 1}`, city: profile.city.split(",")[0].trim(), art: i + 1 }));

  return {
    profile: { ...profile, eventType, eventDate: isoIn(template.daysOut) },
    expenses,
    tasks: template.tasks.map((t, i) => ({
      id: `t${i + 1}`,
      title: t.title,
      category: t.category,
      dueDate: isoIn(t.dueInDays),
      priority: t.priority,
      owner: t.owner,
      done: Boolean(t.done),
    })),
    milestones: template.milestones.map((m, i) => ({
      id: `m${i + 1}`,
      title: m.title,
      detail: m.detail,
      monthsBefore: m.monthsBefore,
      done: Boolean(m.done),
    })),
    guests,
    vendors,
    inspiration: template.inspiration.map((idea, i) => ({
      id: `i${i + 1}`,
      title: idea.title,
      category: idea.category,
      note: idea.note,
      favorite: Boolean(idea.favorite),
      palette: idea.palette,
      art: i + 1,
    })),
    schedule: template.schedule.map((s, i) => ({
      id: `s${i + 1}`,
      time: s.time,
      durationMinutes: s.mins,
      title: s.title,
      detail: s.detail,
      owner: s.owner,
    })),
    shortlist: vendors.filter((v) => v.status === "shortlisted" || v.status === "booked").map((v) => v.id),
  };
}
