import type { EventContext, Generation } from "./ai-schema";
import { GenerationSchema } from "./ai-schema";
import { mockGeneration, mockReply } from "./local-planner";
import { budgetByCategory, budgetSummary, guestSummary, taskSummary, vendorSummary } from "./calculations";
import type { EventState } from "@/types/event";

/**
 * The single place the app talks to an AI.
 *
 * Two implementations behind one interface. With ANTHROPIC_API_KEY set, the
 * server routes call Claude: streaming for chat, a JSON-Schema-constrained
 * call for anything that lands in the dashboard. Without a key, a
 * deterministic local planner answers instead, so the whole product is
 * demonstrable offline and in CI.
 *
 * Nothing here holds a key. The browser only ever talks to our own routes.
 */

export type AiMode = "model" | "demo";

export function buildContext(state: EventState): EventContext {
  const budget = budgetSummary(state);
  const guests = guestSummary(state);
  const tasks = taskSummary(state);
  const vendors = vendorSummary(state);

  return {
    eventType: state.profile.eventType,
    title: state.profile.title,
    hosts: state.profile.hosts,
    eventDate: state.profile.eventDate,
    city: state.profile.city,
    venue: state.profile.venue,
    currency: state.profile.currency,
    totalBudget: state.profile.totalBudget,
    theme: state.profile.theme,
    guestCount: guests.invited,
    committed: Math.round(budget.committed),
    tasksDone: tasks.done,
    tasksTotal: tasks.total,
    vendorsBooked: vendors.booked,
    vendorsTotal: vendors.total,
    topCategories: budgetByCategory(state)
      .sort((a, b) => b.committed - a.committed)
      .slice(0, 6)
      .map((r) => r.category),
  };
}

/* ------------------------------ streaming chat ----------------------------- */

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function askAssistant({
  context,
  history,
  message,
  signal,
  onChunk,
}: {
  context: EventContext;
  history: ChatTurn[];
  message: string;
  signal?: AbortSignal;
  onChunk: (text: string) => void;
}): Promise<AiMode> {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, history, message }),
    signal,
  });

  if (res.status === 503) {
    // No key configured: answer locally, typed out so it still feels live.
    await streamLocally(mockReply(message, context), onChunk, signal);
    return "demo";
  }

  if (!res.ok || !res.body) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.error?.message ?? "The assistant could not answer.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
  return "model";
}

async function streamLocally(text: string, onChunk: (t: string) => void, signal?: AbortSignal) {
  const words = text.split(/(\s+)/);
  for (let i = 0; i < words.length; i += 3) {
    if (signal?.aborted) return;
    onChunk(words.slice(i, i + 3).join(""));
    await new Promise((r) => setTimeout(r, 24));
  }
}

/* --------------------------- structured generation -------------------------- */

export async function generate({
  context,
  prompt,
  signal,
}: {
  context: EventContext;
  prompt: string;
  signal?: AbortSignal;
}): Promise<{ generation: Generation; mode: AiMode }> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, prompt }),
    signal,
  });

  if (res.status === 503) {
    return { generation: mockGeneration(prompt, context), mode: "demo" };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message ?? "Could not generate that.");

  // Validated on the server already; validated again here because this is the
  // boundary where it becomes the couple's data.
  const parsed = GenerationSchema.safeParse(data?.generation);
  if (!parsed.success) throw new Error("The response came back in an unexpected shape.");

  return { generation: parsed.data, mode: "model" };
}

/* --------------------- turning a generation into dashboard rows -------------------- */

export function toDueDate(dueInDays: number): string {
  return new Date(Date.now() + dueInDays * 86_400_000).toISOString().slice(0, 10);
}

const IDEA_PALETTES: [string, string][] = [
  ["#9e2b52", "#b3801a"],
  ["#c75b33", "#b3801a"],
  ["#00879b", "#2e8b57"],
  ["#7b4bb5", "#d1739f"],
];

export function ideaPalette(i: number): [string, string] {
  return IDEA_PALETTES[i % IDEA_PALETTES.length];
}
