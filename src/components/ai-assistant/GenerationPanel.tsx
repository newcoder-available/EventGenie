"use client";

import { Check, Lightbulb, ListChecks, Sparkles, Wallet, Wand2 } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import type { UseAssistant } from "@/hooks/useAssistant";
import { formatMoney } from "@/lib/calculations";
import { themeFor } from "@/lib/eventThemes";
import { Badge, Button, Card, Skeleton } from "@/components/ui";

/**
 * The structured half of the assistant: a request in, a reviewable proposal
 * out. The proposal is deliberately inert — `Apply to my plan` is the only
 * thing that writes to the plan.
 */
export function GenerationPanel({ assistant }: { assistant: UseAssistant }) {
  const { state } = useEvent();
  const { currency } = state.profile;
  const theme = themeFor(state.profile.eventType);
  const { draft, generating, result, applied, runGenerate, applyResult, lastPrompt } = assistant;

  // Two from the occasion's own prompts, two generic, so the chips suit a
  // birthday as readily as a wedding.
  const chips = [theme.suggestions[3], "Plan a budget split", "Decoration ideas", theme.suggestions[5]];

  return (
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
        {chips.map((s) => (
          <button
            key={s}
            onClick={() => runGenerate(s)}
            disabled={generating}
            className="rounded-full border border-[var(--line-strong)] px-2.5 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-sunken)] disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <Button
        variant="gold"
        className="mb-3 w-full"
        disabled={generating || (!draft.trim() && !lastPrompt)}
        onClick={() => runGenerate(draft.trim() || lastPrompt)}
      >
        <Sparkles />
        {generating ? "Generating…" : "Generate"}
      </Button>

      <div
        className="eg-scroll flex-1 overflow-y-auto"
        style={{ maxHeight: "28rem" }}
        aria-busy={generating}
      >
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
                      <span className="min-w-0 flex-1 truncate text-[var(--ink)]">{line.label}</span>
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
  );
}

/** A labelled block inside the proposal. */
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
