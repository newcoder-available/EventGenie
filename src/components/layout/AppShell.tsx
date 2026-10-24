"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * Three-region shell: fixed sidebar from `lg` up, a slide-out drawer below
 * that, and a sticky top bar over the scrolling content.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // A route change should never leave the drawer hanging open behind the page.
  // Covers back/forward navigation, which does not go through onNavigate.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- history is external.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="min-h-dvh">
      <Sidebar />

      <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-[#29242a]/40 backdrop-blur-[2px] lg:hidden" />
          <DialogPrimitive.Content
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 z-[61] w-[17rem] border-r border-[var(--line)] shadow-[var(--shadow-lg)] focus:outline-none lg:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Move between the sections of your plan.
            </DialogPrimitive.Description>
            <DialogPrimitive.Close
              aria-label="Close navigation"
              className="absolute right-3 top-[1.35rem] z-10 rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)]"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* First thing in the tab order: the sidebar is twelve links deep, and
          keyboard users should not have to walk it on every page. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--on-primary)]"
      >
        Skip to main content
      </a>

      <div className="lg:pl-[var(--sidebar-w)]">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-[82rem] px-4 pb-16 pt-6 outline-none sm:px-6 sm:pb-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
