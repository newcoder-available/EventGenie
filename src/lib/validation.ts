import { z } from "zod";
import {
  BUDGET_CATEGORIES,
  EVENT_TYPES,
  INSPIRATION_CATEGORIES,
  TASK_CATEGORIES,
  VENDOR_CATEGORIES,
} from "@/types/event";

/**
 * One set of schemas serving three jobs: form validation, the persistence
 * boundary, and the guard on anything the assistant proposes. Local storage is
 * writable by any script on the origin, so what comes back out of it is parsed
 * exactly as strictly as what a user types in.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker")
  .refine((d) => !Number.isNaN(Date.parse(d)), "That is not a real date");

const money = z
  .number({ invalid_type_error: "Enter an amount" })
  .min(0, "Cannot be negative")
  .max(1_000_000_000, "That is too large");

/** Built-in key, or a visitor-created "custom:<id>". */
export const eventTypeSchema = z.union([
  z.enum(EVENT_TYPES),
  z.string().regex(/^custom:[a-z0-9]{6,16}$/, "Not a valid occasion"),
]);

export const customOccasionSchema = z.object({
  key: z.string().regex(/^custom:[a-z0-9]{6,16}$/),
  label: z.string().trim().min(2).max(40),
  blurb: z.string().trim().max(80),
  accentKey: z.string().max(24),
  motifKey: z.string().max(24),
  icon: z.string().max(24),
  eventNoun: z.string().trim().max(40),
  createdAt: z.string().max(40),
});

export const customOccasionsSchema = z.array(customOccasionSchema).max(24);

export const profileSchema = z.object({
  eventType: eventTypeSchema,
  title: z.string().trim().min(2, "Give it a name").max(60),
  hosts: z.string().trim().min(2, "Who is hosting?").max(60),
  eventDate: isoDate,
  city: z.string().trim().min(2, "Required").max(60),
  venue: z.string().trim().max(80),
  currency: z.enum(["INR", "USD", "GBP", "EUR", "AED", "SGD"]),
  totalBudget: money.min(1000, "Set a realistic budget"),
  theme: z.string().trim().max(120),
});

export const expenseSchema = z
  .object({
    category: z.enum(BUDGET_CATEGORIES),
    label: z.string().trim().min(2, "Give it a name").max(80),
    estimated: money,
    actual: money,
    paidOn: z.union([isoDate, z.literal("")]),
    note: z.string().trim().max(160).optional(),
  })
  .refine((v) => v.actual === 0 || v.paidOn !== "", {
    message: "Add the date it was paid",
    path: ["paidOn"],
  });

export const taskSchema = z.object({
  title: z.string().trim().min(3, "Describe the task").max(90),
  category: z.enum(TASK_CATEGORIES),
  dueDate: isoDate,
  priority: z.enum(["high", "medium", "low"]),
  owner: z.string().trim().min(1, "Who owns it?").max(40),
});

export const guestSchema = z.object({
  name: z.string().trim().min(2, "Required").max(60),
  side: z.string().trim().min(1, "Required").max(24),
  partySize: z
    .number({ invalid_type_error: "Enter a number" })
    .int("Whole people only")
    .min(1, "At least one")
    .max(30, "Split large groups into households"),
  rsvp: z.enum(["accepted", "declined", "pending"]),
  meal: z.enum(["vegetarian", "vegan", "jain", "non-vegetarian", "no preference"]),
  table: z.string().trim().max(12),
  note: z.string().trim().max(160).optional(),
});

export const inspirationSchema = z.object({
  title: z.string().trim().min(2, "Required").max(80),
  category: z.enum(INSPIRATION_CATEGORIES),
  note: z.string().trim().max(200),
});

export const scheduleSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM"),
  durationMinutes: z.number().int().min(5, "At least 5 minutes").max(720),
  title: z.string().trim().min(2, "Required").max(80),
  detail: z.string().trim().max(200),
  owner: z.string().trim().max(60),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type InspirationInput = z.infer<typeof inspirationSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;

/* --------------------- the persistence boundary --------------------- */

const id = z.string().min(1).max(64);

export const sessionSchema = z
  .object({
    eventType: eventTypeSchema.nullable(),
    name: z.string().trim().max(60),
    email: z.string().trim().max(120),
    signedInAt: z.string().max(40),
  })
  .strict();

export const eventStateSchema = z.object({
  profile: profileSchema,
  expenses: z.array(
    z.object({
      id,
      category: z.enum(BUDGET_CATEGORIES),
      label: z.string().max(80),
      estimated: money,
      actual: money,
      paidOn: z.string().max(10),
      vendorId: z.string().max(64).optional(),
      note: z.string().max(200).optional(),
    }),
  ),
  tasks: z.array(
    z.object({
      id,
      title: z.string().max(120),
      category: z.enum(TASK_CATEGORIES),
      dueDate: z.string().max(10),
      priority: z.enum(["high", "medium", "low"]),
      owner: z.string().max(40),
      done: z.boolean(),
      source: z.literal("ai").optional(),
    }),
  ),
  milestones: z.array(
    z.object({
      id,
      title: z.string().max(120),
      detail: z.string().max(240),
      monthsBefore: z.number().min(0).max(36),
      done: z.boolean(),
    }),
  ),
  guests: z.array(
    z.object({
      id,
      name: z.string().max(60),
      side: z.string().max(24),
      partySize: z.number().int().min(1).max(30),
      rsvp: z.enum(["accepted", "declined", "pending"]),
      meal: z.enum(["vegetarian", "vegan", "jain", "non-vegetarian", "no preference"]),
      table: z.string().max(12),
      note: z.string().max(200).optional(),
    }),
  ),
  vendors: z.array(
    z.object({
      id,
      name: z.string().max(80),
      category: z.enum(VENDOR_CATEGORIES),
      city: z.string().max(60),
      priceFrom: money,
      priceTo: money,
      rating: z.number().min(0).max(5),
      reviewCount: z.number().int().min(0),
      status: z.enum(["not contacted", "contacted", "shortlisted", "booked"]),
      description: z.string().max(240),
      art: z.number().int(),
    }),
  ),
  inspiration: z.array(
    z.object({
      id,
      title: z.string().max(80),
      category: z.enum(INSPIRATION_CATEGORIES),
      note: z.string().max(240),
      favorite: z.boolean(),
      palette: z.tuple([z.string().max(9), z.string().max(9)]),
      art: z.number().int(),
      source: z.literal("ai").optional(),
    }),
  ),
  schedule: z.array(
    z.object({
      id,
      time: z.string().max(5),
      durationMinutes: z.number().int().min(0).max(1440),
      title: z.string().max(120),
      detail: z.string().max(240),
      owner: z.string().max(60),
    }),
  ),
  shortlist: z.array(id).max(200),
});
