"use client";

import { useMemo, useState } from "react";
import { Download, Pencil, Trash2, Users } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { themeFor } from "@/lib/eventThemes";
import { guestsToCsv } from "@/lib/csv";
import type { Guest, RsvpStatus } from "@/types/event";
import { Badge, Button, EmptyState, Input, Select } from "@/components/ui";

export function RsvpSummary() {
  const { summary } = useEvent();
  const g = summary.guests;
  const stats = [
    { label: "Invited", value: g.invited, tone: "var(--ink)" },
    { label: "Accepted", value: g.accepted, tone: "var(--success)" },
    { label: "Declined", value: g.declined, tone: "var(--danger)" },
    { label: "Awaiting", value: g.pending, tone: "var(--warning)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl bg-[var(--surface-sunken)] px-3 py-2.5">
          <p className="eg-label">{s.label}</p>
          <p className="num mt-0.5 font-display text-xl" style={{ color: s.tone }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function GuestTable({
  onEdit,
  onAdd,
  limit,
}: {
  onEdit: (g: Guest) => void;
  onAdd?: () => void;
  limit?: number;
}) {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | RsvpStatus>("all");
  const nouns = themeFor(state.profile.eventType).nouns;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.guests.filter((g) => {
      if (filter !== "all" && g.rsvp !== filter) return false;
      if (q && !g.name.toLowerCase().includes(q) && !g.table.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [state.guests, search, filter]);

  const shown = limit ? filtered.slice(0, limit) : filtered;

  function exportCsv() {
    const blob = new Blob([guestsToCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eventgenie-guest-list.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Guest list exported", { detail: `${filtered.length} households` });
  }

  return (
    <div>
      {!limit && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="min-w-[10rem] flex-1">
            <label htmlFor="guest-search" className="sr-only">
              Search guests
            </label>
            <Input
              id="guest-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or table"
            />
          </div>
          <label htmlFor="guest-filter" className="sr-only">
            Filter by RSVP
          </label>
          <Select
            id="guest-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="w-auto"
          >
            <option value="all">All replies</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="pending">Awaiting</option>
          </Select>
          <Button variant="secondary" onClick={exportCsv}>
            <Download />
            Export CSV
          </Button>
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search || filter !== "all" ? "No guests match" : "No guests yet"}
          detail="Add households rather than individuals — the party size column does the counting."
          action={onAdd ? <Button onClick={onAdd}>Add a guest</Button> : undefined}
        />
      ) : (
        <div className="eg-scroll -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left">
                <th className="eg-label py-2 pr-3 font-semibold">Guest</th>
                <th className="eg-label py-2 pr-3 font-semibold">{nouns.guestGroup}</th>
                <th className="eg-label py-2 pr-3 text-right font-semibold">Party</th>
                <th className="eg-label py-2 pr-3 font-semibold">RSVP</th>
                <th className="eg-label py-2 pr-3 font-semibold">Meal</th>
                <th className="eg-label py-2 pr-3 font-semibold">Table</th>
                <th className="eg-label py-2 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--surface-sunken)]/60"
                >
                  <td className="py-2.5 pr-3 font-medium text-[var(--ink)]">{g.name}</td>
                  <td className="py-2.5 pr-3 text-[var(--ink-muted)]">{g.side}</td>
                  <td className="num py-2.5 pr-3 text-right text-[var(--ink-muted)]">
                    {g.partySize}
                  </td>
                  <td className="py-2.5 pr-3">
                    <label className="sr-only" htmlFor={`rsvp-${g.id}`}>
                      RSVP for {g.name}
                    </label>
                    <select
                      id={`rsvp-${g.id}`}
                      value={g.rsvp}
                      onChange={(e) => {
                        dispatch({
                          type: "guest/update",
                          id: g.id,
                          patch: { rsvp: e.target.value as RsvpStatus },
                        });
                        toast("RSVP updated", { detail: `${g.name} · ${e.target.value}` });
                      }}
                      className="cursor-pointer rounded-full border border-[var(--line)] bg-[var(--surface-sunken)] px-2 py-1 text-xs capitalize text-[var(--ink)] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="accepted">accepted</option>
                      <option value="declined">declined</option>
                      <option value="pending">pending</option>
                    </select>
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--ink-muted)]">{g.meal}</td>
                  <td className="py-2.5 pr-3">
                    {g.table && g.table !== "—" ? (
                      <Badge tone="neutral">{g.table}</Badge>
                    ) : (
                      <span className="text-[var(--ink-faint)]">—</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${g.name}`}
                        onClick={() => onEdit(g)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${g.name}`}
                        onClick={() => {
                          dispatch({ type: "guest/delete", id: g.id });
                          toast("Guest removed", { detail: g.name, tone: "info" });
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {limit && filtered.length > limit && (
        <p className="mt-3 text-xs text-[var(--ink-faint)]">
          Showing {limit} of {filtered.length} households.
        </p>
      )}
    </div>
  );
}
