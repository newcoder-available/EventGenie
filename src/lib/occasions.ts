import {
  ACCENT_KEYS,
  EVENT_THEMES,
  ICON_KEYS,
  MOTIF_KEYS,
  isBuiltin,
  makeTheme,
  type AccentKey,
  type EventTheme,
  type IconKey,
  type MotifKey,
} from "./eventThemes";
import { customOccasionsSchema } from "./validation";
import { CUSTOM_PREFIX, type CustomOccasion, type EventType } from "@/types/event";

/**
 * Occasions the visitor created.
 *
 * A custom occasion is not a special case: it is assembled from the same
 * accent, motif and icon parts as the seven built-ins, so it gets the same
 * theming, the same decoration and the same contrast guarantee. Only the
 * words differ.
 */

export const OCCASIONS_KEY = "eventgenie.occasions.v1";

export function loadCustomOccasions(): CustomOccasion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OCCASIONS_KEY);
    if (!raw) return [];
    const parsed = customOccasionsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveCustomOccasions(list: CustomOccasion[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OCCASIONS_KEY, JSON.stringify(list));
  } catch {
    /* private mode: the occasion will not survive a reload */
  }
}

export function newOccasionKey(): string {
  return `${CUSTOM_PREFIX}${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

/** Narrow a stored string back to a known key, falling back to a safe default. */
function asAccent(key: string): AccentKey {
  return (ACCENT_KEYS as string[]).includes(key) ? (key as AccentKey) : "plum";
}
function asMotif(key: string): MotifKey {
  return (MOTIF_KEYS as string[]).includes(key) ? (key as MotifKey) : "confetti";
}
function asIcon(key: string): IconKey {
  return (ICON_KEYS as readonly string[]).includes(key) ? (key as IconKey) : "PartyPopper";
}

/** Turn a stored custom occasion into a full theme. */
export function themeFromCustom(occasion: CustomOccasion): EventTheme {
  const noun = occasion.eventNoun.trim() || occasion.label.toLowerCase();
  return makeTheme({
    key: occasion.key,
    label: occasion.label,
    blurb: occasion.blurb,
    tagline: `Every gathering runs on the same four things: money, time, people, suppliers.`,
    accentKey: asAccent(occasion.accentKey),
    motifKey: asMotif(occasion.motifKey),
    icon: asIcon(occasion.icon),
    custom: true,
    nouns: {
      event: noun,
      host: "Host",
      guestGroup: "Circle",
      guestGroups: ["Family", "Friends", "Work", "Neighbours"],
      dayName: "Event day",
      profileLabel: `My ${occasion.label}`,
    },
    suggestions: [
      `Plan a ${noun} within ₹2 lakh`,
      `Suggest a theme for a ${noun}`,
      "Help me cut the catering budget",
      `Create a 6-week ${noun} checklist`,
      `Decoration ideas for a ${noun}`,
      "Build a running order for the day",
    ],
  });
}

/**
 * Resolve any occasion key to a theme. Safe for unknown keys — a plan saved
 * against an occasion that has since been deleted still renders.
 */
export function resolveTheme(
  key: EventType | null | undefined,
  customs: CustomOccasion[] = [],
): EventTheme {
  if (isBuiltin(key)) return EVENT_THEMES[key];
  const found = customs.find((o) => o.key === key);
  return found ? themeFromCustom(found) : EVENT_THEMES.other;
}
