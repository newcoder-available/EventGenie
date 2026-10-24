"use client";

import { useAssistant } from "@/hooks/useAssistant";
import { cn } from "@/lib/utils";
import { ChatPanel } from "./ChatPanel";
import { GenerationPanel } from "./GenerationPanel";

/**
 * The assistant, as two panels over one piece of state.
 *
 * Conversation on the left, structured generation on the right. Both read the
 * same hook, so asking a question in chat and then pressing Generate reuses
 * what you just typed.
 */
export function Assistant({ compact = false }: { compact?: boolean }) {
  const assistant = useAssistant();

  return (
    <div className={cn("grid gap-4", compact ? "" : "lg:grid-cols-[1.15fr_1fr]")}>
      <ChatPanel assistant={assistant} maxHeight={compact ? "22rem" : "30rem"} />
      <GenerationPanel assistant={assistant} />
    </div>
  );
}
