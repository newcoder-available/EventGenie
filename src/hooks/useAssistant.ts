"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import {
  askAssistant,
  buildContext,
  generate,
  ideaPalette,
  toDueDate,
  type ChatTurn,
} from "@/lib/ai-service";
import type { Generation } from "@/lib/ai-schema";

/**
 * All assistant behaviour, with no markup.
 *
 * Kept apart from the panels so the interesting part — streaming, abort
 * handling, and the rule that nothing is written to the plan without an
 * explicit apply — can be read and reasoned about without scrolling past
 * three hundred lines of layout.
 */
export type UseAssistant = {
  turns: ChatTurn[];
  draft: string;
  setDraft: (value: string) => void;
  /** A reply is streaming in. */
  busy: boolean;
  /** A structured generation is in flight. */
  generating: boolean;
  error: string | null;
  result: Generation | null;
  applied: boolean;
  send: (text: string) => Promise<void>;
  runGenerate: (prompt: string) => Promise<void>;
  applyResult: () => void;
  /** The last thing asked, so Generate can reuse it when the box is empty. */
  lastPrompt: string;
};

/** How much conversation to replay. Enough for context, bounded for cost. */
const HISTORY_TURNS = 8;

export function useAssistant(): UseAssistant {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();
  const context = useMemo(() => buildContext(state), [state]);

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Generation | null>(null);
  const [applied, setApplied] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

  const abort = useRef<AbortController | null>(null);

  // Leaving the page mid-stream should not leave a request running.
  useEffect(() => () => abort.current?.abort(), []);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy) return;

      setError(null);
      setDraft("");
      setLastPrompt(message);

      const history = turns.slice(-HISTORY_TURNS);
      // The empty assistant turn is the one the stream fills in.
      setTurns((t) => [...t, { role: "user", content: message }, { role: "assistant", content: "" }]);
      setBusy(true);

      const controller = new AbortController();
      abort.current = controller;

      try {
        await askAssistant({
          context,
          history,
          message,
          signal: controller.signal,
          onChunk: (chunk) =>
            setTurns((t) => {
              const copy = [...t];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { role: "assistant", content: last.content + chunk };
              return copy;
            }),
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
        // Drop the pair rather than leaving an empty bubble behind.
        setTurns((t) => t.slice(0, -2));
      } finally {
        setBusy(false);
        abort.current = null;
      }
    },
    [busy, context, turns],
  );

  const runGenerate = useCallback(
    async (prompt: string) => {
      const text = prompt.trim();
      if (!text || generating) return;

      setError(null);
      setResult(null);
      setApplied(false);
      setGenerating(true);
      setLastPrompt(text);

      try {
        const { generation } = await generate({ context, prompt: text });
        setResult(generation);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setGenerating(false);
      }
    },
    [context, generating],
  );

  /**
   * The approval gate. A generation is a proposal until this runs, and it
   * only runs from an explicit click — never automatically on arrival.
   */
  const applyResult = useCallback(() => {
    if (!result) return;

    if (result.tasks.length) {
      dispatch({
        type: "ai/applyTasks",
        tasks: result.tasks.map((t) => ({
          title: t.title,
          category: t.category,
          dueDate: toDueDate(t.dueInDays),
          priority: t.priority,
          owner: t.owner,
        })),
      });
    }

    if (result.ideas.length) {
      dispatch({
        type: "ai/applyIdeas",
        items: result.ideas.map((idea, i) => ({
          title: idea.title,
          category: idea.category,
          note: idea.note,
          favorite: false,
          palette: ideaPalette(i),
          art: (i * 7 + 3) % 40,
        })),
      });
    }

    if (result.budgetLines.length) {
      dispatch({
        type: "ai/applyBudget",
        lines: result.budgetLines.map((line) => ({
          category: line.category,
          label: line.label,
          estimated: line.estimated,
          actual: 0,
          paidOn: "",
        })),
      });
    }

    const added = result.tasks.length + result.ideas.length + result.budgetLines.length;
    setApplied(true);
    toast("Added to your plan", {
      detail: `${added} item${added === 1 ? "" : "s"} across your dashboard`,
    });
  }, [dispatch, result, toast]);

  return {
    turns,
    draft,
    setDraft,
    busy,
    generating,
    error,
    result,
    applied,
    send,
    runGenerate,
    applyResult,
    lastPrompt,
  };
}
