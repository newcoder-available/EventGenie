"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import { newId } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
type Toast = { id: string; title: string; detail?: string; tone: ToastTone };

type ToastContextValue = {
  toast: (title: string, opts?: { detail?: string; tone?: ToastTone }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE = {
  success: { icon: Check, color: "var(--success)" },
  error: { icon: TriangleAlert, color: "var(--danger)" },
  info: { icon: Info, color: "var(--primary)" },
} as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    (title, opts) => {
      const id = newId("toast");
      setToasts((t) => [...t.slice(-3), { id, title, detail: opts?.detail, tone: opts?.tone ?? "success" }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), opts?.tone === "error" ? 6000 : 3600),
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Announced politely: feedback should reach a screen reader without
          stealing focus from whatever the person is doing. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((t) => {
          const { icon: Icon, color } = TONE[t.tone];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow-lg)]"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--ink)]">{t.title}</p>
                {t.detail && <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{t.detail}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)]"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
