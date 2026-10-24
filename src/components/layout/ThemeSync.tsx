"use client";

import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";

/**
 * Stamps the chosen occasion onto <html> so the CSS can swap the accent
 * without a hydration round-trip. Rendered once, high in the tree, so every
 * page — public or signed in — picks up the same theme.
 */
export function ThemeSync() {
  const { eventType } = useSession();

  useEffect(() => {
    const root = document.documentElement;
    if (eventType) root.dataset.event = eventType;
    else delete root.dataset.event;
  }, [eventType]);

  return null;
}
