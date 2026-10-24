"use client";

import Link from "next/link";
import { CircleHelp, Keyboard, LifeBuoy, Shield } from "lucide-react";
import { Card, CardHeader, PageHeading } from "@/components/ui";

const FAQS = [
  {
    q: "Where is my data stored?",
    a: "In this browser only, under local storage. There is no account and nothing is kept on a server, so your guest list never leaves your machine. Clearing site data clears the plan, so export a JSON copy from Settings first.",
  },
  {
    q: "Are the vendors real?",
    a: "No. The directory is sample data for the prototype: invented names, indicative prices and demo ratings. Marking one as contacted or booked only updates your own tracker — nobody is notified.",
  },
  {
    q: "How accurate are the budget figures?",
    a: "They are planning estimates sized to your guest count and city, never quotes. Confirm every number with the supplier before you commit, and keep the contingency until the last vendor is paid.",
  },
  {
    q: "What does the AI actually see?",
    a: "Your live dashboard figures — date, city, guest count, budget totals, task and vendor counts — plus the theme you set. It never receives individual guest names, and anything you type is treated as data rather than as instructions to it.",
  },
  {
    q: "Why did my generated plan need approving?",
    a: "Because a model's output is third-party input. It is schema-constrained on the way out, validated again on the way in, and shown to you before a single row is written into your plan.",
  },
];

export default function HelpPage() {
  return (
    <>
      <PageHeading
        title="Help & support"
        subtitle="How EventGenie works, and what it will not do."
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <CardHeader icon={CircleHelp} title="Common questions" />
          <dl className="mt-4 divide-y divide-[var(--line)]">
            {FAQS.map((f) => (
              <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                <dt className="font-medium text-[var(--ink)]">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-[var(--ink-muted)]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <CardHeader icon={Keyboard} title="Getting around" />
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
              <li>
                Search in the top bar covers guests, vendors, tasks, expenses and the run sheet.
              </li>
              <li>The bell shows anything overdue or unanswered, derived live from your plan.</li>
              <li>Every KPI card links through to the page that owns those numbers.</li>
              <li>Print works on the run sheet and produces a clean one-page handout.</li>
            </ul>
          </Card>

          <Card className="p-5">
            <CardHeader icon={Shield} title="Privacy" />
            <p className="mt-3 text-sm text-[var(--ink-muted)]">
              Contact details are stripped server-side before anything reaches the model, so a
              phone number pasted into a note never leaves the app. See{" "}
              <Link href="/settings" className="text-[var(--primary)] hover:underline">
                Settings
              </Link>{" "}
              for how the AI is configured.
            </p>
          </Card>

          <Card className="p-5">
            <CardHeader icon={LifeBuoy} title="Something broken?" />
            <p className="mt-3 text-sm text-[var(--ink-muted)]">
              This is a prototype build. If a number looks wrong, export your JSON from Settings
              before resetting — it is the quickest way to show what happened.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
