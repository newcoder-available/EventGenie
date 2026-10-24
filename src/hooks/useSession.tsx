"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, loadSession, saveSession } from "@/lib/storage";
import type { EventType, Session } from "@/types/event";

/**
 * Which occasion is being planned, and who is planning it.
 *
 * Demo-only and browser-only: there is no auth server, no password and no
 * account. The sign-in step exists so the product has the shape a real one
 * would — pick an occasion, identify yourself, then work — and every screen
 * that shows it says so plainly.
 */

type SessionContextValue = {
  session: Session | null;
  /** False until local storage has been read, so guards do not fire early. */
  ready: boolean;
  eventType: EventType | null;
  chooseEvent: (eventType: EventType) => void;
  signIn: (details: { name: string; email: string }) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setReady(true);
  }, []);

  const persist = useCallback((next: Session | null) => {
    setSession(next);
    if (next) saveSession(next);
    else clearSession();
  }, []);

  const chooseEvent = useCallback(
    (eventType: EventType) => {
      persist({
        eventType,
        name: session?.name ?? "",
        email: session?.email ?? "",
        signedInAt: session?.signedInAt ?? "",
      });
    },
    [persist, session],
  );

  const signIn = useCallback(
    ({ name, email }: { name: string; email: string }) => {
      persist({
        eventType: session?.eventType ?? null,
        name: name.trim(),
        email: email.trim(),
        signedInAt: new Date().toISOString(),
      });
    },
    [persist, session],
  );

  const signOut = useCallback(() => persist(null), [persist]);

  const value = useMemo(
    () => ({
      session,
      ready,
      eventType: session?.eventType ?? null,
      chooseEvent,
      signIn,
      signOut,
    }),
    [session, ready, chooseEvent, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

export function isSignedIn(session: Session | null): boolean {
  return Boolean(session?.eventType && session.signedInAt);
}
