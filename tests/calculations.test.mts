/**
 * Every derived figure in the app, and the sample plans they are derived from.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState, TEMPLATES } from "../src/data/events/index.ts";
import {
  budgetByCategory,
  budgetSummary,
  endTime,
  guestSummary,
  milestoneStatus,
  overallProgress,
  taskSummary,
  vendorSummary,
} from "../src/lib/calculations.ts";
import { eventStateSchema } from "../src/lib/validation.ts";
import { EVENT_TYPES } from "../src/types/event.ts";
import { demoState } from "./fixtures.mts";

const state = demoState;

test("every occasion ships an internally consistent sample plan", () => {
  for (const type of EVENT_TYPES) {
    const s = createDemoState(type);
    const b = budgetSummary(s);
    assert.ok(
      b.committed < b.total,
      `${type}: committed ${b.committed} exceeds the budget ${b.total}`,
    );
    assert.ok(
      b.utilisation > 70 && b.utilisation < 99,
      `${type}: utilisation ${b.utilisation.toFixed(1)}% should sit near, not over, the cap`,
    );
    const g = guestSummary(s);
    assert.equal(g.accepted + g.declined + g.pending, g.invited, `${type}: RSVP split`);
    assert.ok(g.invited > 0, `${type}: no guests`);
    assert.ok(s.tasks.length >= 5, `${type}: too few tasks`);
    assert.ok(s.schedule.length >= 5, `${type}: run sheet too thin`);
    assert.ok(s.vendors.length >= 4, `${type}: too few vendors`);
    // The ledger must add up exactly, not approximately.
    const sum = s.expenses.reduce((acc, e) => acc + e.estimated, 0);
    const allocatable = Math.round(s.profile.totalBudget * (1 - TEMPLATES[type].contingencyPercent / 100));
    assert.equal(sum, allocatable, `${type}: estimates do not sum to the allocatable budget`);
    assert.ok(eventStateSchema.safeParse(s).success, `${type}: fails the persistence boundary`);
  }
});

test("the wedding sample is internally consistent", () => {
  const budget = budgetSummary(state);
  // A demo that opens over budget is a bad first impression and hides the
  // normal state of the UI; keep it comfortably under.
  assert.ok(
    budget.committed < budget.total,
    `demo committed ${budget.committed} exceeds budget ${budget.total}`,
  );
  assert.ok(budget.utilisation > 80 && budget.utilisation < 98, "demo should sit near, not over, the cap");

  const guests = guestSummary(state);
  assert.equal(guests.accepted + guests.declined + guests.pending, guests.invited);
  assert.ok(guests.invited > 0);
});

test("category rollups sum to the committed total", () => {
  const rows = budgetByCategory(state);
  const summary = budgetSummary(state);
  const sum = rows.reduce((s, r) => s + r.committed, 0);
  assert.equal(sum, summary.committed);
  const shares = rows.reduce((s, r) => s + r.share, 0);
  assert.ok(Math.abs(shares - 100) < 0.01, `shares total ${shares}, not 100`);
});

test("committed spend uses the actual once a line is paid", () => {
  const one = {
    ...state,
    expenses: [
      { id: "a", category: "Venue" as const, label: "x", estimated: 100, actual: 150, paidOn: "2026-01-01" },
      { id: "b", category: "Catering" as const, label: "y", estimated: 200, actual: 0, paidOn: "" },
    ],
  };
  const s = budgetSummary(one);
  assert.equal(s.estimated, 300);
  assert.equal(s.actual, 150);
  assert.equal(s.committed, 350); // 150 paid + 200 still only planned
});

test("progress never exceeds 100 even when every part is complete", () => {
  const done = {
    ...state,
    tasks: state.tasks.map((t) => ({ ...t, done: true })),
    vendors: state.vendors.map((v) => ({ ...v, status: "booked" as const })),
    guests: state.guests.map((g) => ({ ...g, rsvp: "accepted" as const })),
    milestones: state.milestones.map((m) => ({ ...m, done: true })),
  };
  const p = overallProgress(done);
  assert.equal(p.percent, 100);
  assert.equal(taskSummary(done).overdue, 0);
  assert.equal(vendorSummary(done).outstanding, 0);
});

test("milestone status is derived from the wedding date, not stored", () => {
  const far = "2099-01-01";
  const near = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
  assert.equal(milestoneStatus(far, 12, false), "upcoming");
  assert.equal(milestoneStatus(near, 0, false), "active");
  assert.equal(milestoneStatus("2020-01-01", 0, false), "overdue");
  assert.equal(milestoneStatus("2020-01-01", 0, true), "done");
});

test("schedule end times roll over the hour and the day", () => {
  assert.equal(endTime("09:30", 45), "10:15");
  assert.equal(endTime("23:30", 60), "00:30");
});
