"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useSession } from "@/hooks/useSession";
import { guestSummary, taskSummary, vendorSummary } from "@/lib/calculations";
import { cn, hostInitials } from "@/lib/utils";
import { themeFor } from "@/lib/eventThemes";
import { EventIcon } from "@/components/ui/EventOrnaments";
import { primaryNav, SECONDARY_NAV, type NavItem } from "./nav";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
        <Sparkles className="h-[1.05rem] w-[1.05rem]" aria-hidden />
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-[var(--surface)] bg-[var(--gold)]"
        />
      </span>
      {!compact && (
        <span className="font-display text-lg leading-none tracking-tight text-[var(--ink)]">
          Event<span className="text-[var(--primary)]">Genie</span>
        </span>
      )}
    </span>
  );
}

function NavLink({
  item,
  badge,
  onNavigate,
}: {
  item: NavItem;
  badge?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[var(--primary)] font-medium text-[var(--on-primary)]"
          : "text-[var(--ink-muted)] hover:bg-[var(--primary-tint)] hover:text-[var(--primary-deep)]",
      )}
    >
      <Icon className="h-[1.05rem] w-[1.05rem] shrink-0" aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "num rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold",
            active
              ? "bg-white/20 text-white"
              : "bg-[var(--surface-sunken)] text-[var(--ink-muted)] group-hover:bg-white",
          )}
        >
          {badge}
        </span>
      )}
      {active && (
        <span
          aria-hidden
          className="absolute -left-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[var(--gold)]"
        />
      )}
    </Link>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useEvent();
  const { session, signOut } = useSession();
  const theme = themeFor(state.profile.eventType);
  const tasks = taskSummary(state);
  const guests = guestSummary(state);
  const vendors = vendorSummary(state);
  const nav = primaryNav(theme.nouns);

  const badgeFor = (item: NavItem) =>
    item.badge === "tasks"
      ? tasks.pending
      : item.badge === "rsvp"
        ? state.guests.filter((g) => g.rsvp === "pending").length
        : item.badge === "vendors"
          ? vendors.outstanding
          : undefined;

  return (
    <div className="flex h-full flex-col bg-[var(--surface)]">
      <div className="flex h-16 shrink-0 items-center border-b border-[var(--line)] px-5">
        <Link href="/dashboard" onClick={onNavigate} className="rounded-lg">
          <Logo />
        </Link>
      </div>

      <nav aria-label="Main" className="eg-scroll flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {nav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} badge={badgeFor(item)} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>

        <div className="my-4 h-px bg-[var(--line)]" />

        <ul className="space-y-0.5">
          {SECONDARY_NAV.map((item) => (
            <li key={item.href}>
              <NavLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-[var(--line)] p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[var(--ink-muted)] transition-colors hover:bg-[var(--primary-tint)] hover:text-[var(--primary-deep)]"
        >
          <span className="text-[var(--primary)]">
            <EventIcon eventType={state.profile.eventType} className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 truncate">{theme.label}</span>
          <span className="text-[var(--ink-faint)]">change</span>
        </Link>
        <div className="flex items-center gap-3 rounded-lg p-2">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] font-display text-sm text-[var(--primary-deep)]"
          >
            {hostInitials(state.profile.hosts)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--ink)]">
              {state.profile.hosts}
            </p>
            <p className="truncate text-xs text-[var(--ink-faint)]">
              {session?.name || `${guests.accepted} of ${guests.invited} confirmed`}
            </p>
          </div>
          <button
            onClick={() => {
              signOut();
              onNavigate?.();
            }}
            aria-label="Sign out and choose another occasion"
            title="Sign out"
            className="rounded-md p-1.5 text-[var(--ink-faint)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)]"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="no-print fixed inset-y-0 left-0 hidden w-[var(--sidebar-w)] border-r border-[var(--line)] lg:block">
      <SidebarContent />
    </aside>
  );
}
