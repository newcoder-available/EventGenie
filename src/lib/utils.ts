import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware class merge: later classes win conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Collision-resistant enough for client-side records; not a security token. */
export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/**
 * Hosts are one free-text field ("Aarav & Meera", "The Sharma family",
 * "Platform Engineering") rather than two name fields, because only a
 * wedding has exactly two. These derive the bits the UI needs.
 */
export function hostParts(hosts: string): string[] {
  return hosts
    .split(/\s*(?:&|\band\b|\+)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function hostInitials(hosts: string): string {
  const parts = hostParts(hosts);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  const words = hosts.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (hosts.trim().slice(0, 2) || "EG").toUpperCase();
}

/** Plausible task owners for the owner picker. */
export function ownerOptions(hosts: string): string[] {
  const parts = hostParts(hosts);
  const base = parts.length > 1 ? [...parts, "Both"] : parts;
  return Array.from(new Set([...base, "Family", "Planner"])).filter(Boolean);
}
