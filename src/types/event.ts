/** Domain model for EventGenie. Every panel in the app reads from these. */

export const EVENT_TYPES = [
  "wedding",
  "birthday",
  "corporate",
  "diwali",
  "anniversary",
  "baby-shower",
  "other",
] as const;
export type BuiltinEventType = (typeof EVENT_TYPES)[number];

/**
 * Built-in occasions plus any the visitor creates, which carry a
 * `custom:<id>` key. `string & {}` keeps editor autocomplete on the built-in
 * literals while still admitting a custom id.
 */
export type EventType = BuiltinEventType | (string & {});

export const CUSTOM_PREFIX = "custom:";
export const isCustomType = (key: string): boolean => key.startsWith(CUSTOM_PREFIX);

/** An occasion the visitor defined, assembled from the same parts as a built-in. */
export type CustomOccasion = {
  /** Always "custom:<id>". */
  key: string;
  label: string;
  blurb: string;
  accentKey: string;
  motifKey: string;
  icon: string;
  /** What to call it mid-sentence, e.g. "graduation party". */
  eventNoun: string;
  createdAt: string;
};

/**
 * Exactly eight named categories plus a neutral catch-all.
 *
 * The count is deliberate: the chart palette was validated as a set of eight
 * hues, and a ninth generated hue would void that. Every event type expresses
 * its spending through these — a corporate offsite puts AV under
 * Entertainment and branding under Decoration — so the palette never has to
 * grow.
 */
export const BUDGET_CATEGORIES = [
  "Venue",
  "Catering",
  "Decoration",
  "Photography",
  "Entertainment",
  "Attire & Styling",
  "Logistics & Travel",
  "Gifts & Stationery",
  "Miscellaneous",
] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const VENDOR_CATEGORIES = [
  "Venue",
  "Caterer",
  "Photographer",
  "Decorator",
  "Entertainment",
  "Florist",
  "Styling",
  "AV & Production",
  "Transport",
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const TASK_CATEGORIES = [
  "Venue",
  "Vendors",
  "Guests",
  "Food",
  "Decor",
  "Programme",
  "Logistics",
  "Attire",
  "Paperwork",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const INSPIRATION_CATEGORIES = [
  "Theme",
  "Decor",
  "Florals",
  "Food",
  "Table Setting",
  "Lighting",
  "Attire",
  "Entertainment",
  "Keepsakes",
] as const;
export type InspirationCategory = (typeof INSPIRATION_CATEGORIES)[number];

export type Priority = "high" | "medium" | "low";
export type RsvpStatus = "accepted" | "declined" | "pending";
export type MealPreference = "vegetarian" | "vegan" | "jain" | "non-vegetarian" | "no preference";
export type BookingStatus = "not contacted" | "contacted" | "shortlisted" | "booked";

export type EventProfile = {
  eventType: EventType;
  /** What the event is called, e.g. "Aarav & Meera" or "Ravi turns 40". */
  title: string;
  /** Who is throwing it. Shown wherever the app addresses the organiser. */
  hosts: string;
  /** ISO date, YYYY-MM-DD. */
  eventDate: string;
  city: string;
  venue: string;
  currency: "INR" | "USD" | "GBP" | "EUR" | "AED" | "SGD";
  totalBudget: number;
  theme: string;
};

export type Expense = {
  id: string;
  category: BudgetCategory;
  label: string;
  estimated: number;
  actual: number;
  /** ISO date. Empty while the spend is only planned. */
  paidOn: string;
  vendorId?: string;
  note?: string;
};

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  dueDate: string;
  priority: Priority;
  owner: string;
  done: boolean;
  /** Set when the task came from the assistant rather than the template. */
  source?: "ai";
};

export type Milestone = {
  id: string;
  title: string;
  detail: string;
  /** Months before the event; the real date is derived, never stored. */
  monthsBefore: number;
  done: boolean;
};

export type Guest = {
  id: string;
  name: string;
  /** Free text so it can read "Bride's side", "Platform team" or "Neighbours". */
  side: string;
  partySize: number;
  rsvp: RsvpStatus;
  meal: MealPreference;
  table: string;
  note?: string;
};

export type Vendor = {
  id: string;
  name: string;
  category: VendorCategory;
  city: string;
  priceFrom: number;
  priceTo: number;
  /** Demo figure. Never presented as a verified review score. */
  rating: number;
  reviewCount: number;
  status: BookingStatus;
  description: string;
  /** Deterministic seed for the generated artwork. */
  art: number;
};

export type InspirationItem = {
  id: string;
  title: string;
  category: InspirationCategory;
  note: string;
  favorite: boolean;
  palette: [string, string];
  art: number;
  source?: "ai";
};

export type ScheduleSlot = {
  id: string;
  /** 24h HH:MM on the day. */
  time: string;
  durationMinutes: number;
  title: string;
  detail: string;
  owner: string;
};

export type EventState = {
  profile: EventProfile;
  expenses: Expense[];
  tasks: Task[];
  milestones: Milestone[];
  guests: Guest[];
  vendors: Vendor[];
  inspiration: InspirationItem[];
  schedule: ScheduleSlot[];
  shortlist: string[];
};

/** Who is signed in, and what they are planning. Demo-only, browser-only. */
export type Session = {
  eventType: EventType | null;
  name: string;
  email: string;
  signedInAt: string;
};
