import type { BuiltinEventType, EventType } from "@/types/event";

/**
 * Per-occasion identity.
 *
 * An occasion is an accent, a motif, an icon and a set of nouns. The seven
 * built-ins are assembled from the same parts a visitor gets when they create
 * their own, so a custom occasion is a first-class citizen rather than a
 * second-rate fallback.
 *
 * Two rules this file lives by:
 *
 * 1. **The canvas and card surfaces never change.** The eight chart series
 *    were validated as a set against the ivory canvas; re-tinting the surface
 *    per occasion would quietly void that guarantee.
 * 2. **Accents come from a fixed, validated set, never a free colour picker.**
 *    Every preset below clears 4.5:1 as text on the canvas, as text on a card,
 *    and as a button background behind white text. A colour wheel would hand
 *    people an unreadable interface in two clicks; scripts/selftest.mts fails
 *    the build if any preset drifts below the threshold.
 */

/* -------------------------------- accents -------------------------------- */

export const ACCENTS = {
  rose: { accent: "#8f3150", deep: "#70253e", tint: "#f6e9ed", secondary: "#d9a0aa", label: "Rose" },
  violet: { accent: "#9a2ba8", deep: "#7a2186", tint: "#f7eaf9", secondary: "#e3b1ea", label: "Violet" },
  blue: { accent: "#2e5f8f", deep: "#244c73", tint: "#e9f0f7", secondary: "#a8c6e0", label: "Blue" },
  saffron: { accent: "#a8490c", deep: "#873a09", tint: "#fbeee4", secondary: "#e8b579", label: "Saffron" },
  gold: { accent: "#8a6212", deep: "#6e4e0e", tint: "#f7f0e0", secondary: "#dcc189", label: "Gold" },
  lilac: { accent: "#6a52c0", deep: "#55429a", tint: "#efecfb", secondary: "#bcb0ea", label: "Lilac" },
  plum: { accent: "#6d4c7d", deep: "#573d64", tint: "#f1ecf4", secondary: "#c3aed0", label: "Plum" },
  teal: { accent: "#0e6b74", deep: "#0b545b", tint: "#e4f1f2", secondary: "#8fc6cb", label: "Teal" },
  forest: { accent: "#2f6b3a", deep: "#25552e", tint: "#e8f1e9", secondary: "#9cc4a3", label: "Forest" },
  crimson: { accent: "#a5342c", deep: "#842a23", tint: "#faeae8", secondary: "#e3a59f", label: "Crimson" },
  indigo: { accent: "#3a4a9e", deep: "#2e3b7e", tint: "#ecedf8", secondary: "#aeb5e4", label: "Indigo" },
  slate: { accent: "#4a5560", deep: "#3b444d", tint: "#eef0f2", secondary: "#b6bdc4", label: "Slate" },
} as const;

export type AccentKey = keyof typeof ACCENTS;
export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

/* --------------------------------- motifs -------------------------------- */

export const MOTIFS = {
  marigold: {
    label: "Marigold garland",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><g fill="#000"><g transform="translate(18 18)"><circle cx="0" cy="-9" r="4"/><circle cx="6.4" cy="-6.4" r="4"/><circle cx="9" cy="0" r="4"/><circle cx="6.4" cy="6.4" r="4"/><circle cx="0" cy="9" r="4"/><circle cx="-6.4" cy="6.4" r="4"/><circle cx="-9" cy="0" r="4"/><circle cx="-6.4" cy="-6.4" r="4"/><circle cx="0" cy="0" r="3.2"/></g><circle cx="54" cy="54" r="3"/><circle cx="54" cy="18" r="2"/><circle cx="18" cy="54" r="2"/></g></svg>`,
  },
  balloons: {
    label: "Balloons and cake",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76"><g fill="#000"><ellipse cx="16" cy="16" rx="8" ry="10"/><path d="M16 26v10" stroke="#000" stroke-width="1.4" fill="none"/><ellipse cx="34" cy="22" rx="6.5" ry="8.5"/><path d="M34 30.5v8" stroke="#000" stroke-width="1.2" fill="none"/><path d="M50 56h18l-9-14z"/><rect x="50" y="56" width="18" height="4" rx="1"/><circle cx="59" cy="38" r="2"/><rect x="8" y="52" width="7" height="2.8" rx="1.4" transform="rotate(-28 11.5 53.4)"/><rect x="26" y="60" width="7" height="2.8" rx="1.4" transform="rotate(40 29.5 61.4)"/><circle cx="66" cy="16" r="2.4"/><circle cx="42" cy="48" r="1.8"/></g></svg>`,
  },
  chevrons: {
    label: "Clean geometry",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><path d="M0 36 12 24 24 36"/><path d="M24 36 36 24 48 36"/><path d="M0 12 12 0 24 12"/><path d="M24 12 36 0 48 12"/></g></svg>`,
  },
  diya: {
    label: "Diyas and rangoli",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76"><g fill="#000"><path d="M8 34c0 5 5 8 11 8s11-3 11-8z"/><path d="M19 30c0-4-3-5-3-8 0-2 3-4 3-4s3 2 3 4c0 3-3 4-3 8z"/><g transform="translate(56 24)"><circle r="3"/><circle cx="0" cy="-9" r="2"/><circle cx="9" cy="0" r="2"/><circle cx="0" cy="9" r="2"/><circle cx="-9" cy="0" r="2"/><circle cx="6.4" cy="-6.4" r="1.5"/><circle cx="6.4" cy="6.4" r="1.5"/><circle cx="-6.4" cy="6.4" r="1.5"/><circle cx="-6.4" cy="-6.4" r="1.5"/></g><path d="M38 54c.9 3.8 1.8 4.7 5.6 5.6-3.8.9-4.7 1.8-5.6 5.6-.9-3.8-1.8-4.7-5.6-5.6 3.8-.9 4.7-1.8 5.6-5.6z"/><circle cx="12" cy="60" r="2"/><circle cx="66" cy="58" r="2.4"/></g></svg>`,
  },
  rings: {
    label: "Interlocking rings",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><g fill="none" stroke="#000" stroke-width="2.5"><circle cx="26" cy="26" r="12"/><circle cx="42" cy="26" r="12"/><circle cx="34" cy="58" r="7"/></g></svg>`,
  },
  stars: {
    label: "Stars and clouds",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><g fill="#000"><path d="M16 4c1.6 7 3.4 8.8 10.4 10.4C19.4 16 17.6 17.8 16 24.8 14.4 17.8 12.6 16 5.6 14.4 12.6 12.8 14.4 11 16 4z"/><path d="M46 30c1.3 5.6 2.7 7 8.3 8.3-5.6 1.3-7 2.7-8.3 8.3-1.3-5.6-2.7-7-8.3-8.3 5.6-1.3 7-2.7 8.3-8.3z"/><circle cx="50" cy="12" r="2.6"/><circle cx="12" cy="46" r="2.2"/><circle cx="30" cy="58" r="1.8"/></g></svg>`,
  },
  confetti: {
    label: "Confetti and streamers",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><g fill="#000"><rect x="6" y="8" width="9" height="3.5" rx="1.75" transform="rotate(-24 10.5 9.75)"/><rect x="38" y="4" width="9" height="3.5" rx="1.75" transform="rotate(38 42.5 5.75)"/><rect x="22" y="26" width="9" height="3.5" rx="1.75" transform="rotate(-62 26.5 27.75)"/><rect x="48" y="34" width="9" height="3.5" rx="1.75" transform="rotate(16 52.5 35.75)"/><rect x="10" y="46" width="9" height="3.5" rx="1.75" transform="rotate(52 14.5 47.75)"/><rect x="34" y="54" width="9" height="3.5" rx="1.75" transform="rotate(-18 38.5 55.75)"/><circle cx="56" cy="18" r="2.4"/><circle cx="4" cy="30" r="2"/><circle cx="30" cy="42" r="2"/></g></svg>`,
  },
} as const;

export type MotifKey = keyof typeof MOTIFS;
export const MOTIF_KEYS = Object.keys(MOTIFS) as MotifKey[];

/* --------------------------------- icons --------------------------------- */

export const ICON_KEYS = [
  "Heart",
  "Cake",
  "Briefcase",
  "Flame",
  "Gem",
  "Baby",
  "PartyPopper",
  "Gift",
  "Music",
  "Utensils",
  "Home",
  "GraduationCap",
] as const;
export type IconKey = (typeof ICON_KEYS)[number];

/* --------------------------------- themes -------------------------------- */

export type EventNouns = {
  /** "wedding", "birthday", "offsite" — used mid-sentence. */
  event: string;
  /** What the host row is called: "Couple", "Birthday star", "Organiser". */
  host: string;
  /** Label for the Guests page grouping column. */
  guestGroup: string;
  /** Suggestions for that column. */
  guestGroups: string[];
  /** "Wedding day", "Party day", "Event day". */
  dayName: string;
  /** Sidebar label for the profile page. */
  profileLabel: string;
};

export type EventTheme = {
  key: EventType;
  label: string;
  blurb: string;
  tagline: string;
  accentKey: AccentKey;
  motifKey: MotifKey;
  icon: IconKey;
  nouns: EventNouns;
  /** Starter prompts for the assistant, written for this occasion. */
  suggestions: string[];
  custom: boolean;
  /* Resolved from accentKey / motifKey so consumers never look them up. */
  accent: string;
  accentDeep: string;
  accentTint: string;
  secondary: string;
  motif: string;
};

type ThemeSpec = Omit<EventTheme, "accent" | "accentDeep" | "accentTint" | "secondary" | "motif" | "custom"> & {
  custom?: boolean;
};

/** Assemble a theme from its accent and motif keys. */
export function makeTheme(spec: ThemeSpec): EventTheme {
  const a = ACCENTS[spec.accentKey];
  return {
    ...spec,
    custom: spec.custom ?? false,
    accent: a.accent,
    accentDeep: a.deep,
    accentTint: a.tint,
    secondary: a.secondary,
    motif: MOTIFS[spec.motifKey].svg,
  };
}

export const EVENT_THEMES: Record<BuiltinEventType, EventTheme> = {
  wedding: makeTheme({
    key: "wedding",
    label: "Wedding",
    blurb: "Multi-day, many vendors, long runway",
    tagline: "Long runway, many moving parts — book the scarce things first.",
    accentKey: "rose",
    motifKey: "marigold",
    icon: "Heart",
    nouns: {
      event: "wedding",
      host: "Couple",
      guestGroup: "Side",
      guestGroups: ["Bride's side", "Groom's side", "Both"],
      dayName: "Wedding day",
      profileLabel: "My Wedding",
    },
    suggestions: [
      "Plan a wedding within ₹15 lakh",
      "Suggest a royal Rajasthani theme",
      "Help me reduce my catering budget",
      "Create a 6-month wedding checklist",
      "Decoration ideas for an outdoor evening",
      "Build a wedding-day schedule",
    ],
  }),
  birthday: makeTheme({
    key: "birthday",
    label: "Birthday",
    blurb: "One room, one evening, high expectations",
    tagline: "One evening to get right — the food and the first hour carry it.",
    accentKey: "violet",
    motifKey: "balloons",
    icon: "Cake",
    nouns: {
      event: "birthday",
      host: "Birthday star",
      guestGroup: "Circle",
      guestGroups: ["Family", "Friends", "Work", "Neighbours"],
      dayName: "Party day",
      profileLabel: "My Birthday",
    },
    suggestions: [
      "Plan a 40th within ₹2 lakh",
      "Suggest a theme for a rooftop party",
      "Help me cut the bar and catering budget",
      "Create a 6-week birthday checklist",
      "Decoration ideas for a rooftop at night",
      "Build a running order for the evening",
    ],
  }),
  corporate: makeTheme({
    key: "corporate",
    label: "Corporate event",
    blurb: "Agenda, AV, travel and a budget to justify",
    tagline: "The agenda is the event. Everything else serves it.",
    accentKey: "blue",
    motifKey: "chevrons",
    icon: "Briefcase",
    nouns: {
      event: "offsite",
      host: "Organiser",
      guestGroup: "Team",
      guestGroups: ["Engineering", "Design", "Sales", "Leadership", "Guests"],
      dayName: "Event day",
      profileLabel: "My Event",
    },
    suggestions: [
      "Plan a two-day offsite within ₹10 lakh",
      "Suggest a shape for the two-day agenda",
      "Help me cut travel and accommodation costs",
      "Create an 8-week offsite checklist",
      "Ideas for making the hybrid sessions work",
      "Build a day-one running order",
    ],
  }),
  diwali: makeTheme({
    key: "diwali",
    label: "Diwali or festival",
    blurb: "Lights, sweets, open house, lots of neighbours",
    tagline: "Lights, sweets and an open door — plan for more people than replied.",
    accentKey: "saffron",
    motifKey: "diya",
    icon: "Flame",
    nouns: {
      event: "Diwali celebration",
      host: "Host",
      guestGroup: "Circle",
      guestGroups: ["Family", "Neighbours", "Friends", "Work", "Society"],
      dayName: "Festival day",
      profileLabel: "My Celebration",
    },
    suggestions: [
      "Plan a Diwali open house within ₹2 lakh",
      "Suggest a decoration theme built on diyas",
      "Help me cut the catering budget",
      "Create a 4-week Diwali checklist",
      "Lighting ideas for the terrace and stairs",
      "Build an evening running order",
    ],
  }),
  anniversary: makeTheme({
    key: "anniversary",
    label: "Anniversary",
    blurb: "Smaller guest list, higher per-head",
    tagline: "Fewer people, more spent on each — the detail is the point.",
    accentKey: "gold",
    motifKey: "rings",
    icon: "Gem",
    nouns: {
      event: "anniversary",
      host: "Couple",
      guestGroup: "Circle",
      guestGroups: ["Family", "Friends", "Children", "Colleagues"],
      dayName: "The day",
      profileLabel: "My Anniversary",
    },
    suggestions: [
      "Plan a 40th anniversary lunch within ₹5 lakh",
      "Suggest a gold and ivory direction",
      "Help me reduce the catering budget",
      "Create a 3-month checklist",
      "Ideas for a seated afternoon with elders",
      "Build an afternoon running order",
    ],
  }),
  "baby-shower": makeTheme({
    key: "baby-shower",
    label: "Baby shower",
    blurb: "Daytime, intimate, comfort over spectacle",
    tagline: "Daytime and decor-led — comfort beats spectacle.",
    accentKey: "lilac",
    motifKey: "stars",
    icon: "Baby",
    nouns: {
      event: "baby shower",
      host: "Host",
      guestGroup: "Circle",
      guestGroups: ["Family", "Friends", "Work", "Neighbours"],
      dayName: "The day",
      profileLabel: "My Shower",
    },
    suggestions: [
      "Plan a baby shower within ₹1 lakh",
      "Suggest a soft daytime theme",
      "Help me keep the food budget down",
      "Create a 6-week checklist",
      "Ideas for a comfortable garden setup",
      "Build an afternoon running order",
    ],
  }),
  other: makeTheme({
    key: "other",
    label: "Something else",
    blurb: "Housewarming, reunion, farewell, anything",
    tagline: "Every gathering runs on the same four things: money, time, people, suppliers.",
    accentKey: "plum",
    motifKey: "confetti",
    icon: "PartyPopper",
    nouns: {
      event: "celebration",
      host: "Host",
      guestGroup: "Circle",
      guestGroups: ["Family", "Friends", "Work", "Neighbours"],
      dayName: "Event day",
      profileLabel: "My Event",
    },
    suggestions: [
      "Plan a housewarming within ₹1.5 lakh",
      "Suggest a warm, informal direction",
      "Help me cut the catering budget",
      "Create a 6-week checklist",
      "Ideas for a terrace in the evening",
      "Build an evening running order",
    ],
  }),
};

export const EVENT_ORDER: BuiltinEventType[] = [
  "wedding",
  "birthday",
  "corporate",
  "diwali",
  "anniversary",
  "baby-shower",
  "other",
];

/** Data URI for the tile, used as a CSS mask so it inherits the accent. */
export function motifUrl(motif: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(motif)}")`;
}

export function isBuiltin(key: EventType | null | undefined): key is BuiltinEventType {
  return Boolean(key && key in EVENT_THEMES);
}

/**
 * Resolve a built-in occasion. Callers that must also see visitor-created
 * occasions use resolveTheme() in lib/occasions.ts, which falls back here.
 */
export function themeFor(key: EventType | null | undefined): EventTheme {
  return isBuiltin(key) ? EVENT_THEMES[key] : EVENT_THEMES.other;
}
