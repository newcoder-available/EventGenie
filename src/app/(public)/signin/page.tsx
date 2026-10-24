"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { themeFor } from "@/lib/eventThemes";
import { templateFor } from "@/data/events";
import { Button, Field, Input } from "@/components/ui";
import { EventIcon, EventOrnaments, Motif } from "@/components/ui/EventOrnaments";
import { Logo } from "@/components/layout/Sidebar";

/**
 * Step two: who is planning it.
 *
 * Deliberately not a password form. There is no auth server behind this and
 * no account is created, so asking for a password would be theatre that
 * teaches people to type a real one into a demo. A name and an email are
 * enough to personalise the dashboard, and both stay in this browser.
 */
export default function SignInPage() {
  const router = useRouter();
  const { session, ready, eventType, signIn } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Someone who lands here directly has not chosen an occasion yet.
  useEffect(() => {
    if (ready && !eventType) router.replace("/");
  }, [ready, eventType, router]);

  useEffect(() => {
    if (session?.name) setName(session.name);
    if (session?.email) setEmail(session.email);
  }, [session]);

  if (!ready || !eventType) return null;

  const theme = themeFor(eventType);
  const template = templateFor(eventType);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Tell us what to call you";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) next.email = "That does not look like an email";
    setErrors(next);
    if (Object.keys(next).length) return;

    signIn({ name, email });
    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Occasion side — the theme you just chose, made visible. */}
      <aside className="eg-hero relative hidden overflow-hidden border-r border-[var(--line)] p-10 lg:flex lg:flex-col">
        <EventOrnaments eventType={eventType} />
        <Motif eventType={eventType} opacity={0.05} size={72} />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative mt-auto max-w-sm">
          <span
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--primary)]"
            style={{ background: theme.accentTint }}
          >
            <EventIcon eventType={eventType} className="h-6 w-6" />
          </span>
          <p className="eg-label mb-1.5">{theme.label}</p>
          <h2 className="font-display text-3xl leading-tight text-[var(--ink)]">
            {theme.tagline}
          </h2>
          <p className="mt-4 text-sm text-[var(--ink-muted)]">
            Your plan starts from a realistic sample: {template.tasks.length} tasks,{" "}
            {template.budget.length} budget lines, {template.vendors.length} vendors and a full
            run sheet. Edit anything, or clear it and start from nothing.
          </p>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Change occasion
          </Link>

          <p className="eg-label mb-1">Step 2 of 2</p>
          <h1 className="font-display text-2xl text-[var(--ink)]">
            Who is planning this {theme.nouns.event}?
          </h1>
          <p className="mt-1.5 text-sm text-[var(--ink-muted)]">
            So the dashboard can address you properly.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <Field label="Your name" error={errors.name} htmlFor="signin-name">
              <Input
                id="signin-name"
                value={name}
                autoComplete="name"
                placeholder={template.profile.hosts.split(" ")[0]}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <Field label="Email" error={errors.email} htmlFor="signin-email">
              <Input
                id="signin-email"
                type="email"
                value={email}
                autoComplete="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Button type="submit" size="lg" className="w-full">
              Open my planner
              <ArrowRight />
            </Button>
          </form>

          <p className="mt-5 flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-sunken)] p-3 text-xs leading-relaxed text-[var(--ink-muted)]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              <strong className="text-[var(--ink)]">Demo sign-in.</strong> No account is created
              and there is no password, because there is no server behind this. Your name, your
              email and your whole plan stay in this browser.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
