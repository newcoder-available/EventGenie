"use client";

import { useEffect, useRef } from "react";
import { Send, Sparkles, TriangleAlert } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import type { UseAssistant } from "@/hooks/useAssistant";
import { themeFor } from "@/lib/eventThemes";
import { Button, Card, Skeleton, Textarea } from "@/components/ui";

/** The conversation half of the assistant: streaming replies and the composer. */
export function ChatPanel({
  assistant,
  maxHeight = "30rem",
}: {
  assistant: UseAssistant;
  maxHeight?: string;
}) {
  const { state } = useEvent();
  const theme = themeFor(state.profile.eventType);
  const { turns, draft, setDraft, busy, error, send } = assistant;

  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  return (
    <Card className="flex min-h-[26rem] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
          <Sparkles className="h-[1.05rem] w-[1.05rem]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base text-[var(--ink)]">AI Planning Assistant</h2>
          <p className="truncate text-xs text-[var(--ink-faint)]">
            Sees your live budget, checklist and vendors
          </p>
        </div>
      </div>

      {/* Replies arrive token by token, so this region is announced politely
          rather than interrupting whatever the reader is doing. */}
      <div
        ref={scroller}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="eg-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4"
        style={{ maxHeight }}
      >
        {turns.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
              Hi {state.profile.hosts} — I&apos;m your AI planner for this {theme.nouns.event}. Ask
              me anything about the plan, or pick one of these.
            </p>
            <div className="flex flex-col gap-2">
              {theme.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-left text-xs text-[var(--ink-muted)] transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--primary-tint)] hover:text-[var(--primary-deep)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) => (
          <div
            key={i}
            className={
              turn.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--primary-tint)] px-3.5 py-2.5 text-sm text-[var(--ink)]"
                : "max-w-[92%] whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-muted)]"
            }
          >
            {turn.content ||
              (busy && i === turns.length - 1 ? (
                <span className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-56" />
                </span>
              ) : null)}
          </div>
        ))}

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-tint)] px-3 py-2 text-xs text-[var(--danger)]"
          >
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-end gap-2 border-t border-[var(--line)] p-3"
      >
        <label htmlFor="assistant-input" className="sr-only">
          Ask the assistant
        </label>
        <Textarea
          id="assistant-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter is a newline, as in every chat app.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="Ask about the budget, the timeline, the vendors…"
          className="max-h-28 min-h-10 flex-1 resize-none py-2.5"
        />
        <Button type="submit" size="icon" disabled={busy || !draft.trim()} aria-label="Send">
          <Send />
        </Button>
      </form>
    </Card>
  );
}
