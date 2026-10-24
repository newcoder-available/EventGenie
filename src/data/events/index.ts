import type { BuiltinEventType, EventState, EventType } from "@/types/event";
import { buildState, type EventTemplate } from "../template";
import { weddingTemplate } from "./wedding";
import { birthdayTemplate } from "./birthday";
import { corporateTemplate } from "./corporate";
import { diwaliTemplate } from "./diwali";
import { anniversaryTemplate, babyShowerTemplate, otherTemplate } from "./compact";

export const TEMPLATES: Record<BuiltinEventType, EventTemplate> = {
  wedding: weddingTemplate,
  birthday: birthdayTemplate,
  corporate: corporateTemplate,
  diwali: diwaliTemplate,
  anniversary: anniversaryTemplate,
  "baby-shower": babyShowerTemplate,
  other: otherTemplate,
};

/** A visitor-created occasion starts from the general-purpose template. */
export function templateFor(eventType: EventType): EventTemplate {
  return (TEMPLATES as Record<string, EventTemplate>)[eventType] ?? TEMPLATES.other;
}

/** A fresh, internally consistent demo plan for the chosen occasion. */
export function createDemoState(eventType: EventType): EventState {
  return buildState(eventType, templateFor(eventType));
}
