/**
 * CSV export, against the characters that break a naive join.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { escapeCsvCell, guestsToCsv } from "../src/lib/csv.ts";
import { demoState } from "./fixtures.mts";

const state = demoState;

test("CSV export survives the characters that break a naive join", () => {
  assert.equal(escapeCsvCell("Sam"), "Sam");
  assert.equal(escapeCsvCell("O'Brien, Sam"), '"O\'Brien, Sam"');
  assert.equal(escapeCsvCell('He said "yes"'), '"He said ""yes"""');
  assert.equal(escapeCsvCell("line one\nline two"), '"line one\nline two"');
  assert.equal(escapeCsvCell(12), "12");
});

test("the exported guest list has one row per household and a stable header", () => {
  const csv = guestsToCsv(state.guests);
  const lines = csv.split("\r\n");
  assert.equal(lines.length, state.guests.length + 1);
  assert.equal(lines[0], "Name,Group,Party size,RSVP,Meal,Table,Note");
  // A quoted cell may contain a comma, so count only unquoted separators.
  for (const line of lines) {
    const unquoted = line.replace(/"(?:[^"]|"")*"/g, "");
    assert.equal(unquoted.split(",").length, 7, `wrong column count: ${line}`);
  }
});
