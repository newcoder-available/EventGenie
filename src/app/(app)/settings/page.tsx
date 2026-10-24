"use client";

import { useState } from "react";
import { Download, Pencil, RotateCcw, Shield, Sparkles } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { Button, Card, CardHeader, PageHeading } from "@/components/ui";
import { ProfileDialog } from "@/components/dashboard/ProfileDialog";

export default function SettingsPage() {
  const { state, resetToDemo } = useEvent();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eventgenie-${state.profile.eventType}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Plan exported");
  }

  return (
    <>
      <PageHeading
        title="Settings"
        subtitle="Your event details, your data, and how the AI is wired up."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader
            icon={Pencil}
            title="Event details"
            subtitle="Names, date, city, venue, budget and theme."
          />
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Changing the date recalculates every milestone and the countdown. Changing the budget
            re-derives the KPI cards and the budget ring.
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            <Pencil />
            Edit event details
          </Button>
        </Card>

        <Card className="p-5">
          <CardHeader
            icon={Shield}
            title="Your data"
            subtitle="Where it lives and how to get it out."
          />
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Everything stays in this browser&apos;s local storage. There is no account and no
            server-side copy, which is also why clearing site data clears your plan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportJson}>
              <Download />
              Export JSON
            </Button>
            {confirming ? (
              <>
                <Button
                  variant="danger"
                  onClick={() => {
                    resetToDemo();
                    setConfirming(false);
                    toast("Reset to the sample plan", { tone: "info" });
                  }}
                >
                  Yes, reset everything
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setConfirming(true)}>
                <RotateCcw />
                Reset to demo data
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardHeader
            icon={Sparkles}
            title="AI assistant"
            subtitle="How EventGenie decides between the real model and the built-in planner."
          />
          <div className="mt-3 space-y-3 text-sm text-[var(--ink-muted)]">
            <p>
              With{" "}
              <code className="rounded bg-[var(--surface-sunken)] px-1.5 py-0.5 font-mono text-xs">
                ANTHROPIC_API_KEY
              </code>{" "}
              set in{" "}
              <code className="rounded bg-[var(--surface-sunken)] px-1.5 py-0.5 font-mono text-xs">
                .env.local
              </code>
              , the assistant streams from Claude, and anything it generates is constrained by a
              JSON schema then validated again before it touches your plan.
            </p>
            <p>
              Without a key, a deterministic local planner answers instead, so the product stays
              fully usable offline. The assistant tells you which one replied.
            </p>
            <p>
              The key is read on the server only. The browser never holds it and never talks to the
              model provider directly.
            </p>
          </div>
        </Card>
      </div>

      <ProfileDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
