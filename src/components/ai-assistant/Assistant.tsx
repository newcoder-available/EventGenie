"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Lightbulb,
  ListChecks,
  Send,
  Sparkles,
  TriangleAlert,
  Wallet,
  Wand2,
} from "lucide-react";
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
import { formatMoney } from "@/lib/calculations";
import { themeFor } from "@/lib/eventThemes";
import { cn } from "@/lib/utils";
import { Badge, Button, Card, Skeleton, Textarea } from "@/components/ui";

export function Assistant({ compact = false }: { compact?: boolean }) {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();
  const context = useMemo(() => buildContext(state), [state]);
  const theme = themeFor(state.profile.eventType);
  const nouns = theme.nouns;

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Generation | null>(null);
  const [applied, setApplied] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

  const scroller = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, result]);

  useEffect(() => () => abort.current?.abort(), []);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    setError(null);
    setDraft("");
    setLastPrompt(message);
    const history = turns.slice(-8);
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
            copy[copy.length - 1] = {
              role: "assistant",
              content: copy[copy.length - 1].content + chunk,
            };
            return copy;
          }),
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setTurns((t) => t.slice(0, -2));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  async function runGenerate(prompt: string) {
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
  }

  /** Nothing from the model touches the plan until the couple says so. */
  function applyResult() {
    if (!result) return;
    let added = 0;

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
      added += result.tasks.length;
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
      added += result.ideas.length;
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
      added += result.budgetLines.length;
    }

    setApplied(true);
    toast("Added to your plan", {
      detail: `${added} item${added === 1 ? "" : "s"} across your dashboard`,
    });
  }

  const { currency } = state.profile;

  return (
    <div className={cn("grid gap-4", compact ? "" : "lg:grid-cols-[1.15fr_1fr]")}>
      {/* ------------------------------ chat ------------------------------ */}
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

        <div
          ref={scroller}
          className="eg-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4"
          style={{ maxHeight: compact ? "22rem" : "30rem" }}
        >
          {turns.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
                Hi {state.profile.hosts} — I&apos;m your AI planner for this{" "}
                {nouns.event}. Ask me anything about the plan, or pick one of these.
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

      {/* ---------------------------- generation --------------------------- */}
      <Card className="flex flex-col p-4">
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--gold-tint)] text-[#7a5e1e]">
            <Wand2 className="h-[1.05rem] w-[1.05rem]" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-base text-[var(--ink)]">Generate into your plan</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Produces real tasks, ideas and budget lines. Nothing is saved until you apply it.
            </p>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {[theme.suggestions[3], "Plan a budget split", "Decoration ideas", theme.suggestions[5]].map(
            (s) => (
              <button
                key={s}
                onClick={() => runGenerate(s)}
                disabled={generating}
                className="rounded-full border border-[var(--line-strong)] px-2.5 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-sunken)] disabled:opacity-50"
              >
                {s}
              </button>
            ),
          )}
        </div>

        <div className="mb-3 flex gap-2">
          <Button
            variant="gold"
            className="flex-1"
            disabled={generating || (!draft.trim() && !lastPrompt)}
            onClick={() => runGenerate(draft.trim() || lastPrompt)}
          >
            <Sparkles />
            {generating ? "Generating…" : "Generate"}
          </Button>
        </div>

        <div className="eg-scroll flex-1 overflow-y-auto" style={{ maxHeight: "28rem" }}>
          {generating && (
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="mt-4 h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {!generating && !result && (
            <div className="flex h-full min-h-[8rem] items-center justify-center rounded-lg border border-dashed border-[var(--line-strong)] px-4 py-8 text-center">
              <p className="max-w-xs text-xs text-[var(--ink-muted)]">
                Pick a suggestion or type a request, then press Generate. What comes back lands in
                your checklist, inspiration board and budget — once you approve it.
              </p>
            </div>
          )}

          {!generating && result && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base text-[var(--ink)]">{result.headline}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {result.summary}
                </p>
              </div>

              {result.tasks.length > 0 && (
                <Section icon={ListChecks} title={`${result.tasks.length} tasks`}>
                  <ul className="space-y-1.5">
                    {result.tasks.map((t, i) => (
                      <li key={i} className="flex items-start justify-between gap-3 text-xs">
                        <span className="min-w-0 flex-1 text-[var(--ink)]">{t.title}</span>
                        <span className="num shrink-0 text-[var(--ink-faint)]">
                          {t.dueInDays}d · {t.owner}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {result.ideas.length > 0 && (
                <Section icon={Lightbulb} title={`${result.ideas.length} ideas`}>
                  <ul className="space-y-2">
                    {result.ideas.map((idea, i) => (
                      <li key={i} className="text-xs">
                        <p className="font-medium text-[var(--ink)]">{idea.title}</p>
                        <p className="mt-0.5 text-[var(--ink-muted)]">{idea.note}</p>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {result.budgetLines.length > 0 && (
                <Section icon={Wallet} title={`${result.budgetLines.length} budget lines`}>
                  <ul className="space-y-1.5">
                    {result.budgetLines.map((line, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 text-xs">
                        <span className="min-w-0 flex-1 truncate text-[var(--ink)]">
                          {line.label}
                        </span>
                        <span className="num shrink-0 text-[var(--ink-muted)]">
                          {formatMoney(line.estimated, currency, true)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {result.assumptions.length > 0 && (
                <div className="rounded-lg bg-[var(--surface-sunken)] p-3">
                  <p className="eg-label mb-1.5">Assumed</p>
                  <ul className="space-y-1">
                    {result.assumptions.map((a, i) => (
                      <li key={i} className="text-xs text-[var(--ink-muted)]">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.notes.length > 0 && (
                <ul className="space-y-1">
                  {result.notes.map((n, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[var(--ink-faint)]">
                      <span aria-hidden>—</span>
                      {n}
                    </li>
                  ))}
                </ul>
              )}

              <div className="sticky bottom-0 -mx-1 bg-[var(--surface)] px-1 pb-1 pt-2">
                {applied ? (
                  <Badge tone="success" className="w-full justify-center py-2">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Added to your plan
                  </Badge>
                ) : (
                  <Button className="w-full" onClick={applyResult}>
                    <Check />
                    Apply to my plan
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)]">
        <Icon className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden />
        {title}
      </p>
      {children}
    </div>
  );
}
