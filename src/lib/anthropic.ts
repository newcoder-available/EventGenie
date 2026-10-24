import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only module. The key is read from process.env at call time and is
 * never serialised into a response, a log line, or a client bundle. Importing
 * this file from a Client Component is a build error by design.
 */
import "server-only";

export const MODEL = process.env.EVENTGENIE_MODEL ?? "claude-opus-5-5";
export const EFFORT = (process.env.EVENTGENIE_EFFORT ?? "medium") as
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max";

/** Server-side refusal routing: a declined request falls back automatically. */
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";

let client: Anthropic | null = null;

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 2,
      timeout: 120_000,
    });
  }
  return client;
}
