import {
  CalendarClock,
  CalendarHeart,
  CircleHelp,
  Heart,
  Image,
  LayoutDashboard,
  ListChecks,
  Settings,
  Sparkles,
  Store,
  Users,
  Wallet,
} from "lucide-react";

import type { EventNouns } from "@/lib/eventThemes";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Shown as a count chip in the sidebar. */
  badge?: "tasks" | "rsvp" | "vendors";
};

/** Labels follow the occasion, so a birthday never reads "My Wedding". */
export function primaryNav(nouns: EventNouns): NavItem[] {
  return [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/my-event", label: nouns.profileLabel, icon: Heart },
    { href: "/budget", label: "Budget Planner", icon: Wallet },
    { href: "/checklist", label: "Checklist", icon: ListChecks, badge: "tasks" },
    { href: "/timeline", label: "Timeline", icon: CalendarClock },
    { href: "/guests", label: "Guests & RSVP", icon: Users, badge: "rsvp" },
    { href: "/vendors", label: "Vendors", icon: Store, badge: "vendors" },
    { href: "/inspiration", label: "Inspiration Board", icon: Image },
    { href: "/schedule", label: "Run Sheet", icon: CalendarHeart },
    { href: "/assistant", label: "AI Planning Assistant", icon: Sparkles },
  ];
}

export const SECONDARY_NAV: NavItem[] = [
  { href: "/help", label: "Help & Support", icon: CircleHelp },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Page titles for the top bar, keyed by route. */
export function pageTitles(nouns: EventNouns): Record<string, string> {
  return Object.fromEntries(
    [...primaryNav(nouns), ...SECONDARY_NAV].map((i) => [i.href, i.label]),
  );
}
