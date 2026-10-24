"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui";

/**
 * Route-level error boundary.
 *
 * Without this an unhandled render error leaves a blank page. The reset
 * button re-renders the segment, which is usually enough — the plan itself
 * lives in local storage and is untouched by a render failure, so the escape
 * hatch is honest rather than hopeful.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // A name and digest only: never the message, which can carry user data.
    console.error("route_error", { name: error.name, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger-tint)] text-[var(--danger)]">
        <TriangleAlert className="h-5 w-5" aria-hidden />
      </span>
      <h1 className="font-display text-2xl text-[var(--ink)]">That page did not load</h1>
      <p className="mt-2 max-w-md text-sm text-[var(--ink-muted)]">
        Something went wrong rendering this section. Your plan is stored in this browser and has
        not been affected.
      </p>
      <Button className="mt-6" onClick={reset}>
        <RotateCcw />
        Try again
      </Button>
    </div>
  );
}
