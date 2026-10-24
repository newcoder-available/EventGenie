import Link from "next/link";
import { Compass } from "lucide-react";

/** 404. Sends people to the picker rather than a dead end. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-tint)] text-[var(--primary)]">
        <Compass className="h-5 w-5" aria-hidden />
      </span>
      <h1 className="font-display text-2xl text-[var(--ink)]">No such page</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--ink-muted)]">
        The link may be out of date. Start from your occasion and we will take you back to your
        plan.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--on-primary)] transition-colors hover:bg-[var(--primary-deep)]"
      >
        Back to the start
      </Link>
    </div>
  );
}
