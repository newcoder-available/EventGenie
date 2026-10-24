/**
 * The two validation boundaries: forms in, and local storage back out.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
  eventStateSchema,
  expenseSchema,
  guestSchema,
  profileSchema,
} from "../src/lib/validation.ts";
import { demoState } from "./fixtures.mts";

const state = demoState;

test("the demo state passes the persistence boundary", () => {
  const parsed = eventStateSchema.safeParse(state);
  assert.ok(parsed.success, JSON.stringify(parsed.error?.issues?.slice(0, 4)));
});

test("form schemas reject bad input", () => {
  assert.equal(profileSchema.safeParse({ ...state.profile, totalBudget: 5 }).success, false);
  assert.equal(profileSchema.safeParse({ ...state.profile, eventDate: "18/02/2027" }).success, false);
  assert.equal(
    guestSchema.safeParse({ name: "X", side: "bride", partySize: 0, rsvp: "pending", meal: "vegan", table: "" }).success,
    false,
  );
  // An amount marked paid with no date is a data-entry slip, not a valid row.
  assert.equal(
    expenseSchema.safeParse({ category: "Venue", label: "Hall", estimated: 100, actual: 100, paidOn: "" }).success,
    false,
  );
  assert.equal(
    expenseSchema.safeParse({ category: "Venue", label: "Hall", estimated: 100, actual: 0, paidOn: "" }).success,
    true,
  );
});
