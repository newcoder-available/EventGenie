"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { createDemoState } from "@/data/events";
import {
  budgetByCategory,
  budgetSummary,
  guestSummary,
  overallProgress,
  taskSummary,
  vendorSummary,
  type CategoryRollup,
} from "@/lib/calculations";
import { clearPlan, loadPlan, savePlan } from "@/lib/storage";
import { useSession } from "@/hooks/useSession";
import { newId } from "@/lib/utils";
import type {
  EventType,
  Expense,
  Guest,
  InspirationItem,
  ScheduleSlot,
  Task,
  Vendor,
  EventProfile,
  EventState,
} from "@/types/event";

/**
 * One reducer owns the whole wedding. Every page reads derived numbers from
 * it rather than keeping local copies, so a budget edit on one screen moves
 * the KPI cards on another without any wiring between them.
 */

type Action =
  | { type: "hydrate"; state: EventState }
  | { type: "profile/set"; profile: EventProfile }
  | { type: "expense/add"; expense: Omit<Expense, "id"> }
  | { type: "expense/update"; id: string; patch: Partial<Expense> }
  | { type: "expense/delete"; id: string }
  | { type: "task/add"; task: Omit<Task, "id" | "done"> & { done?: boolean } }
  | { type: "task/update"; id: string; patch: Partial<Task> }
  | { type: "task/toggle"; id: string }
  | { type: "task/delete"; id: string }
  | { type: "milestone/toggle"; id: string }
  | { type: "guest/add"; guest: Omit<Guest, "id"> }
  | { type: "guest/update"; id: string; patch: Partial<Guest> }
  | { type: "guest/delete"; id: string }
  | { type: "vendor/status"; id: string; status: Vendor["status"] }
  | { type: "vendor/shortlist"; id: string }
  | { type: "inspiration/add"; item: Omit<InspirationItem, "id"> }
  | { type: "inspiration/update"; id: string; patch: Partial<InspirationItem> }
  | { type: "inspiration/delete"; id: string }
  | { type: "schedule/add"; slot: Omit<ScheduleSlot, "id"> }
  | { type: "schedule/update"; id: string; patch: Partial<ScheduleSlot> }
  | { type: "schedule/delete"; id: string }
  | { type: "ai/applyTasks"; tasks: Omit<Task, "id" | "done">[] }
  | { type: "ai/applyIdeas"; items: Omit<InspirationItem, "id">[] }
  | { type: "ai/applyBudget"; lines: Omit<Expense, "id">[] }
  | { type: "reset"; eventType: EventType };

function patchList<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function reducer(state: EventState, action: Action): EventState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "profile/set":
      return { ...state, profile: action.profile };

    case "expense/add":
      return { ...state, expenses: [...state.expenses, { ...action.expense, id: newId("e") }] };
    case "expense/update":
      return { ...state, expenses: patchList(state.expenses, action.id, action.patch) };
    case "expense/delete":
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };

    case "task/add":
      return {
        ...state,
        tasks: [...state.tasks, { done: false, ...action.task, id: newId("t") }],
      };
    case "task/update":
      return { ...state, tasks: patchList(state.tasks, action.id, action.patch) };
    case "task/toggle":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };
    case "task/delete":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    case "milestone/toggle":
      return {
        ...state,
        milestones: state.milestones.map((m) =>
          m.id === action.id ? { ...m, done: !m.done } : m,
        ),
      };

    case "guest/add":
      return { ...state, guests: [...state.guests, { ...action.guest, id: newId("g") }] };
    case "guest/update":
      return { ...state, guests: patchList(state.guests, action.id, action.patch) };
    case "guest/delete":
      return { ...state, guests: state.guests.filter((g) => g.id !== action.id) };

    case "vendor/status": {
      const vendors = patchList(state.vendors, action.id, { status: action.status });
      // Shortlist and status are two views of the same decision; keep them agreed.
      const shortlisted = action.status === "shortlisted" || action.status === "booked";
      const shortlist = shortlisted
        ? Array.from(new Set([...state.shortlist, action.id]))
        : state.shortlist.filter((id) => id !== action.id);
      return { ...state, vendors, shortlist };
    }
    case "vendor/shortlist": {
      const on = state.shortlist.includes(action.id);
      const vendor = state.vendors.find((v) => v.id === action.id);
      const vendors =
        !on && vendor?.status === "not contacted"
          ? patchList(state.vendors, action.id, { status: "shortlisted" as const })
          : state.vendors;
      return {
        ...state,
        vendors,
        shortlist: on
          ? state.shortlist.filter((id) => id !== action.id)
          : [...state.shortlist, action.id],
      };
    }

    case "inspiration/add":
      return {
        ...state,
        inspiration: [{ ...action.item, id: newId("i") }, ...state.inspiration],
      };
    case "inspiration/update":
      return { ...state, inspiration: patchList(state.inspiration, action.id, action.patch) };
    case "inspiration/delete":
      return { ...state, inspiration: state.inspiration.filter((i) => i.id !== action.id) };

    case "schedule/add":
      return {
        ...state,
        schedule: [...state.schedule, { ...action.slot, id: newId("s") }].sort((a, b) =>
          a.time.localeCompare(b.time),
        ),
      };
    case "schedule/update":
      return {
        ...state,
        schedule: patchList(state.schedule, action.id, action.patch).sort((a, b) =>
          a.time.localeCompare(b.time),
        ),
      };
    case "schedule/delete":
      return { ...state, schedule: state.schedule.filter((s) => s.id !== action.id) };

    case "ai/applyTasks": {
      // Never duplicate a task the couple already has.
      const existing = new Set(state.tasks.map((t) => t.title.toLowerCase().trim()));
      const fresh = action.tasks
        .filter((t) => !existing.has(t.title.toLowerCase().trim()))
        .map((t) => ({ ...t, id: newId("t"), done: false, source: "ai" as const }));
      return { ...state, tasks: [...state.tasks, ...fresh] };
    }
    case "ai/applyIdeas": {
      const existing = new Set(state.inspiration.map((i) => i.title.toLowerCase().trim()));
      const fresh = action.items
        .filter((i) => !existing.has(i.title.toLowerCase().trim()))
        .map((i) => ({ ...i, id: newId("i"), source: "ai" as const }));
      return { ...state, inspiration: [...fresh, ...state.inspiration] };
    }
    case "ai/applyBudget": {
      const existing = new Set(state.expenses.map((e) => e.label.toLowerCase().trim()));
      const fresh = action.lines
        .filter((e) => !existing.has(e.label.toLowerCase().trim()))
        .map((e) => ({ ...e, id: newId("e") }));
      return { ...state, expenses: [...state.expenses, ...fresh] };
    }

    case "reset":
      return createDemoState(action.eventType);

    default:
      return state;
  }
}

/**
 * Every derived figure in the app, computed once per state change.
 *
 * Fourteen components used to call these selectors directly in render, and
 * overallProgress alone walks the tasks, vendors, guests and milestones. That
 * is seven full passes over the plan for one KPI row, repeated on every
 * keystroke anywhere in the tree. Computing them here means one pass per
 * change, shared by everyone through context.
 */
export type EventSummary = {
  budget: ReturnType<typeof budgetSummary>;
  categories: CategoryRollup[];
  guests: ReturnType<typeof guestSummary>;
  tasks: ReturnType<typeof taskSummary>;
  vendors: ReturnType<typeof vendorSummary>;
  progress: ReturnType<typeof overallProgress>;
};

type EventContextValue = {
  state: EventState;
  summary: EventSummary;
  dispatch: React.Dispatch<Action>;
  ready: boolean;
  resetToDemo: () => void;
};

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { eventType, ready: sessionReady } = useSession();
  // "other" is the neutral fallback so the reducer always has a shape to work
  // with, even on the public pages where no occasion has been chosen yet.
  const active: EventType = eventType ?? "other";

  // Start from the demo set on both server and client so the first paint
  // matches, then swap in anything saved once we are safely on the client.
  const [state, dispatch] = useReducer(reducer, active, createDemoState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!sessionReady) return;
    dispatch({ type: "hydrate", state: loadPlan(active) });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- local storage cannot be read during render.
    setReady(true);
  }, [active, sessionReady]);

  // Persistence is coalesced: ticking six checklist items used to serialise
  // and write the whole plan six times. A short debounce collapses a burst
  // into one write, and a pagehide flush means nothing is lost on the way out.
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => savePlan(active, state), 400);
    const flush = () => savePlan(active, state);
    window.addEventListener("pagehide", flush);
    return () => {
      clearTimeout(id);
      window.removeEventListener("pagehide", flush);
    };
  }, [state, ready, active]);

  const resetToDemo = useCallback(() => {
    clearPlan(active);
    dispatch({ type: "reset", eventType: active });
  }, [active]);

  const summary = useMemo<EventSummary>(
    () => ({
      budget: budgetSummary(state),
      categories: budgetByCategory(state),
      guests: guestSummary(state),
      tasks: taskSummary(state),
      vendors: vendorSummary(state),
      progress: overallProgress(state),
    }),
    [state],
  );

  const value = useMemo(
    () => ({ state, summary, dispatch, ready, resetToDemo }),
    [state, summary, ready, resetToDemo],
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent(): EventContextValue {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvent must be used inside <EventProvider>");
  return ctx;
}
