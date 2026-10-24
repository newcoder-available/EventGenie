import type { Priority } from "@/types/event";

/** The filters the checklist offers, shared by the bar and the list. */
export const TASK_FILTERS = ["All", "Pending", "Completed", "Overdue"] as const;
export type TaskFilter = (typeof TASK_FILTERS)[number];

/** Priority never rests on colour alone; the badge also carries the word. */
export const PRIORITY_TONE: Record<Priority, "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};
