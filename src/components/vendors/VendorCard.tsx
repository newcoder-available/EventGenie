"use client";

import { Bookmark, BookmarkCheck, Check, MapPin, Phone, Star } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useToast } from "@/hooks/useToast";
import { formatMoney } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { BookingStatus, Vendor } from "@/types/event";
import { Artwork } from "@/components/ui/Artwork";
import { Badge, Button } from "@/components/ui";

const STATUS_TONE: Record<BookingStatus, "neutral" | "warning" | "primary" | "success"> = {
  "not contacted": "neutral",
  contacted: "warning",
  shortlisted: "primary",
  booked: "success",
};

const ART_PALETTE: [string, string][] = [
  ["#9e2b52", "#b3801a"],
  ["#c75b33", "#b3801a"],
  ["#00879b", "#2e8b57"],
  ["#7b4bb5", "#d1739f"],
  ["#2f5fa8", "#00879b"],
];

export function VendorCard({
  vendor,
  selected,
  onToggleCompare,
}: {
  vendor: Vendor;
  selected?: boolean;
  onToggleCompare?: (id: string) => void;
}) {
  const { state, dispatch } = useEvent();
  const { toast } = useToast();
  const shortlisted = state.shortlist.includes(vendor.id);
  const currency = state.profile.currency;

  function setStatus(status: BookingStatus) {
    dispatch({ type: "vendor/status", id: vendor.id, status });
    toast(`Marked as ${status}`, { detail: vendor.name });
  }

  return (
    <article
      className={cn(
        "eg-card eg-rise flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-lg)]",
        selected && "ring-2 ring-[var(--primary)]",
      )}
    >
      <div className="relative h-32 shrink-0">
        <Artwork seed={vendor.art} palette={ART_PALETTE[vendor.art % ART_PALETTE.length]} />
        <div className="absolute left-3 top-3">
          <Badge tone={STATUS_TONE[vendor.status]} className="bg-[var(--surface)]/90 backdrop-blur">
            {vendor.status}
          </Badge>
        </div>
        <button
          onClick={() => {
            dispatch({ type: "vendor/shortlist", id: vendor.id });
            toast(shortlisted ? "Removed from shortlist" : "Added to shortlist", {
              detail: vendor.name,
              tone: shortlisted ? "info" : "success",
            });
          }}
          aria-pressed={shortlisted}
          aria-label={shortlisted ? `Remove ${vendor.name} from shortlist` : `Shortlist ${vendor.name}`}
          className="absolute right-3 top-3 rounded-lg bg-[var(--surface)]/90 p-2 text-[var(--ink-muted)] backdrop-blur transition-colors hover:text-[var(--primary)] aria-pressed:text-[var(--primary)]"
        >
          {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base text-[var(--ink)]">{vendor.name}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--ink-faint)]">
              <span>{vendor.category}</span>
              <span aria-hidden>·</span>
              <MapPin className="h-3 w-3" aria-hidden />
              {vendor.city}
            </p>
          </div>
          {/* Labelled as sample data: these are invented vendors. */}
          <span
            className="num flex shrink-0 items-center gap-1 text-xs text-[var(--ink-muted)]"
            title="Sample rating — demo data, not a verified review score"
          >
            <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" aria-hidden />
            {vendor.rating.toFixed(1)}
            <span className="text-[var(--ink-faint)]">({vendor.reviewCount})</span>
          </span>
        </div>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">
          {vendor.description}
        </p>

        <p className="num mt-3 text-sm font-medium text-[var(--ink)]">
          {formatMoney(vendor.priceFrom, currency, true)} –{" "}
          {formatMoney(vendor.priceTo, currency, true)}
          <span className="ml-1 text-xs font-normal text-[var(--ink-faint)]">indicative</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {vendor.status !== "booked" ? (
            <>
              {vendor.status === "not contacted" && (
                <Button size="sm" variant="secondary" onClick={() => setStatus("contacted")}>
                  <Phone />
                  Mark contacted
                </Button>
              )}
              <Button size="sm" onClick={() => setStatus("booked")}>
                <Check />
                Mark booked
              </Button>
            </>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setStatus("contacted")}>
              Undo booking
            </Button>
          )}
          {onToggleCompare && (
            <Button
              size="sm"
              variant={selected ? "quiet" : "ghost"}
              onClick={() => onToggleCompare(vendor.id)}
              aria-pressed={selected}
            >
              {selected ? "In comparison" : "Compare"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
