import { createDemoState } from "@/data/events";
import { eventStateSchema, sessionSchema } from "@/lib/validation";
import type { EventState, EventType, Session } from "@/types/event";

/**
 * Local persistence.
 *
 * Everything stays in the browser — there is no server-side store and so no
 * personal data at rest anywhere else. What comes back out is re-validated:
 * local storage is writable by any script on this origin, so it is not
 * trusted merely because we wrote it.
 *
 * Plans are keyed per occasion, so someone can plan a wedding, switch to a
 * birthday, and come back to find both intact.
 */

export const SESSION_KEY = "eventgenie.session.v1";
export const planKey = (eventType: EventType) => `eventgenie.plan.${eventType}.v1`;

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = sessionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* private mode: the session will not survive a reload */
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing to do */
  }
}

export function loadPlan(eventType: EventType): EventState {
  if (typeof window === "undefined") return createDemoState(eventType);
  try {
    const raw = window.localStorage.getItem(planKey(eventType));
    if (!raw) return createDemoState(eventType);
    const parsed = eventStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.warn("Saved plan did not validate; starting from the demo set.");
      return createDemoState(eventType);
    }
    return parsed.data as EventState;
  } catch {
    return createDemoState(eventType);
  }
}

export function savePlan(eventType: EventType, state: EventState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(planKey(eventType), JSON.stringify(state));
  } catch {
    /* private mode or quota: the plan will not survive a reload */
  }
}

export function clearPlan(eventType: EventType): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(planKey(eventType));
  } catch {
    /* nothing to do */
  }
}
