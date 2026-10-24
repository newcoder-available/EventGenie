"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSignedIn, useSession } from "@/hooks/useSession";
import { Logo } from "./Sidebar";

/**
 * Keeps the planner behind the two setup steps: pick an occasion, then sign
 * in. Client-side only, because there is no server-side session to check —
 * this is about flow, not about protecting anything. Nothing sensitive sits
 * behind it; the data is in the visitor's own browser either way.
 */
export function RequireSession({ children }: { children: React.ReactNode }) {
  const { session, ready } = useSession();
  const router = useRouter();
  const allowed = isSignedIn(session);

  useEffect(() => {
    if (!ready || allowed) return;
    router.replace(session?.eventType ? "/signin" : "/");
  }, [ready, allowed, session, router]);

  if (!ready || !allowed) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <Logo />
        <p className="text-sm text-[var(--ink-muted)]">
          {ready ? "Taking you back to the start…" : "Loading your plan…"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
