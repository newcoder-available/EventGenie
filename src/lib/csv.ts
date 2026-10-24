import type { Guest } from "@/types/event";

/**
 * CSV export, built in the browser — the guest list never touches a server.
 *
 * Lives here rather than in the table component so the escaping rules can be
 * tested directly: a guest called `O'Brien, Sam` or a note containing a
 * newline is exactly the input that corrupts a naive join.
 */

const GUEST_COLUMNS = ["Name", "Group", "Party size", "RSVP", "Meal", "Table", "Note"] as const;

/** RFC 4180: quote anything containing a delimiter, quote or newline; double inner quotes. */
export function escapeCsvCell(value: string | number): string {
  const s = String(value ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function guestsToCsv(guests: Guest[]): string {
  const rows = guests.map((g) =>
    [g.name, g.side, g.partySize, g.rsvp, g.meal, g.table, g.note ?? ""]
      .map(escapeCsvCell)
      .join(","),
  );
  return [GUEST_COLUMNS.join(","), ...rows].join("\r\n");
}
