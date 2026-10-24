"use client";

import { useMemo, useState } from "react";
import { Bookmark, Columns3, Store, X } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { formatMoney, vendorSummary } from "@/lib/calculations";
import { VENDOR_CATEGORIES, type BookingStatus, type VendorCategory } from "@/types/event";
import { Badge, Button, Card, EmptyState, Input, PageHeading, Select } from "@/components/ui";
import { VendorCard } from "@/components/vendors/VendorCard";

const STATUSES: (BookingStatus | "all")[] = [
  "all",
  "not contacted",
  "contacted",
  "shortlisted",
  "booked",
];

export default function VendorsPage() {
  const { state } = useEvent();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<VendorCategory | "all">("all");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);

  const summary = vendorSummary(state);
  const { currency } = state.profile;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.vendors.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (status !== "all" && v.status !== status) return false;
      if (shortlistOnly && !state.shortlist.includes(v.id)) return false;
      if (q && !v.name.toLowerCase().includes(q) && !v.description.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [state.vendors, state.shortlist, search, category, status, shortlistOnly]);

  const comparing = state.vendors.filter((v) => compare.includes(v.id));

  function toggleCompare(id: string) {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-3)));
  }

  return (
    <>
      <PageHeading
        title="Vendors"
        subtitle={`${summary.booked} booked · ${summary.contacted} in progress · ${summary.outstanding} still to lock in`}
      />

      <div className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--warning-tint)] px-4 py-2.5 text-xs text-[var(--ink-muted)]">
        <strong className="text-[var(--ink)]">Sample directory.</strong> These vendors, prices and
        ratings are demo data for the prototype. Nobody has been contacted or booked — marking a
        status here only updates your own tracker.
      </div>

      {/* Filters, one row above the results. */}
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="vendor-search" className="sr-only">
              Search vendors
            </label>
            <Input
              id="vendor-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or what they do"
            />
          </div>

          <label htmlFor="vendor-cat" className="sr-only">
            Filter by category
          </label>
          <Select
            id="vendor-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="w-auto"
          >
            <option value="all">All categories</option>
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <label htmlFor="vendor-status" className="sr-only">
            Filter by status
          </label>
          <Select
            id="vendor-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Any status" : s}
              </option>
            ))}
          </Select>

          <Button
            variant={shortlistOnly ? "primary" : "secondary"}
            onClick={() => setShortlistOnly((v) => !v)}
            aria-pressed={shortlistOnly}
          >
            <Bookmark />
            Shortlist ({state.shortlist.length})
          </Button>
        </div>
      </Card>

      {comparing.length > 0 && (
        <Card className="mb-4 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <Columns3 className="h-4 w-4 text-[var(--primary)]" aria-hidden />
              Comparing {comparing.length}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setCompare([])}>
              <X />
              Clear
            </Button>
          </div>
          <div className="eg-scroll -mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left">
                  <th className="eg-label py-2 pr-3 font-semibold">Vendor</th>
                  <th className="eg-label py-2 pr-3 font-semibold">Category</th>
                  <th className="eg-label py-2 pr-3 font-semibold">Indicative price</th>
                  <th className="eg-label py-2 pr-3 font-semibold">Rating</th>
                  <th className="eg-label py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {comparing.map((v) => (
                  <tr key={v.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-[var(--ink)]">{v.name}</td>
                    <td className="py-2.5 pr-3 text-[var(--ink-muted)]">{v.category}</td>
                    <td className="num py-2.5 pr-3 text-[var(--ink-muted)]">
                      {formatMoney(v.priceFrom, currency, true)} –{" "}
                      {formatMoney(v.priceTo, currency, true)}
                    </td>
                    <td className="num py-2.5 pr-3 text-[var(--ink-muted)]">
                      {v.rating.toFixed(1)}{" "}
                      <span className="text-[var(--ink-faint)]">({v.reviewCount})</span>
                    </td>
                    <td className="py-2.5">
                      <Badge tone={v.status === "booked" ? "success" : "neutral"}>{v.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors match those filters"
          detail="Clear a filter or widen the search to see the rest of the directory."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setStatus("all");
                setShortlistOnly(false);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <VendorCard
              key={v.id}
              vendor={v}
              selected={compare.includes(v.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}
    </>
  );
}
