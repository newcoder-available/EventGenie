"use client";

import { cn } from "@/lib/utils";

/** Loading placeholder. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("eg-skeleton", className)} />;
}
