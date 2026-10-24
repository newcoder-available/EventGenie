import { z } from "zod";
import { eventTypeSchema } from "./validation";
import {
  BUDGET_CATEGORIES,
  INSPIRATION_CATEGORIES,
  TASK_CATEGORIES,
} from "@/types/event";

/**
 * The contract between the model and the dashboard.
 *
 * Declared twice on purpose: as JSON Schema, which constrains what the model
 * is allowed to emit, and as Zod, which re-checks the result before a single
 * row reaches the couple's data. A model response is third-party input and
 * gets the same treatment as anything a user types.
 */

const short = z.string().trim().min(1).max(120);
const para = z.string().trim().min(1).max(400);

export const GenerationSchema = z
  .object({
    headline: short,
    summary: para,
    assumptions: z.array(short).max(4).default([]),
    tasks: z
      .array(
        z.object({
          title: short,
          category: z.enum(TASK_CATEGORIES),
          dueInDays: z.number().int().min(0).max(1095),
          priority: z.enum(["high", "medium", "low"]),
          owner: z.string().trim().min(1).max(40),
        }),
      )
      .max(10)
      .default([]),
    ideas: z
      .array(
        z.object({
          title: short,
          category: z.enum(INSPIRATION_CATEGORIES),
          note: para,
        }),
      )
      .max(8)
      .default([]),
    budgetLines: z
      .array(
        z.object({
          category: z.enum(BUDGET_CATEGORIES),
          label: short,
          estimated: z.number().min(0).max(1_000_000_000),
        }),
      )
      .max(10)
      .default([]),
    notes: z.array(short).max(4).default([]),
  })
  .strict();

export type Generation = z.infer<typeof GenerationSchema>;

/* ---------------------- the same shape, for the API ---------------------- */

const str = (maxLength: number) => ({ type: "string", maxLength }) as const;
const enumOf = (values: readonly string[]) => ({ type: "string", enum: [...values] });
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const GENERATION_JSON_SCHEMA = obj({
  headline: str(120),
  summary: str(400),
  assumptions: { type: "array", maxItems: 4, items: str(120) },
  tasks: {
    type: "array",
    maxItems: 10,
    items: obj({
      title: str(120),
      category: enumOf(TASK_CATEGORIES),
      dueInDays: { type: "integer", minimum: 0, maximum: 1095 },
      priority: enumOf(["high", "medium", "low"]),
      owner: str(40),
    }),
  },
  ideas: {
    type: "array",
    maxItems: 8,
    items: obj({
      title: str(120),
      category: enumOf(INSPIRATION_CATEGORIES),
      note: str(400),
    }),
  },
  budgetLines: {
    type: "array",
    maxItems: 10,
    items: obj({
      category: enumOf(BUDGET_CATEGORIES),
      label: str(120),
      estimated: { type: "number", minimum: 0 },
    }),
  },
  notes: { type: "array", maxItems: 4, items: str(120) },
});

/* ----------------------------- API payloads ----------------------------- */

export const EventContextSchema = z
  .object({
    eventType: eventTypeSchema,
    title: z.string().trim().max(60),
    hosts: z.string().trim().max(60),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    city: z.string().trim().max(60),
    venue: z.string().trim().max(80),
    currency: z.enum(["INR", "USD", "GBP", "EUR", "AED", "SGD"]),
    totalBudget: z.number().min(0).max(1_000_000_000),
    theme: z.string().trim().max(120),
    guestCount: z.number().int().min(0).max(100_000),
    committed: z.number().min(0).max(1_000_000_000),
    tasksDone: z.number().int().min(0).max(1000),
    tasksTotal: z.number().int().min(0).max(1000),
    vendorsBooked: z.number().int().min(0).max(1000),
    vendorsTotal: z.number().int().min(0).max(1000),
    topCategories: z.array(z.string().trim().max(60)).max(10).default([]),
  })
  .strict();

export type EventContext = z.infer<typeof EventContextSchema>;

export const GenerateRequestSchema = z
  .object({
    context: EventContextSchema,
    prompt: z.string().trim().min(3).max(600),
  })
  .strict();

export const AssistantRequestSchema = z
  .object({
    context: EventContextSchema,
    history: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim().min(1).max(4000),
          })
          .strict(),
      )
      .max(16)
      .default([]),
    message: z.string().trim().min(1).max(1000),
  })
  .strict();
