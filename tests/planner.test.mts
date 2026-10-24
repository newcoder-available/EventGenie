/**
 * The offline planner: grounded replies, schema-valid output, and no occasion borrowing another's vocabulary.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/events/index.ts";
import { buildContext } from "../src/lib/ai-service.ts";
import { classify, mockGeneration, mockReply } from "../src/lib/local-planner.ts";
import { GenerationSchema } from "../src/lib/ai-schema.ts";
import { EVENT_THEMES } from "../src/lib/eventThemes.ts";
import { BUDGET_CATEGORIES, EVENT_TYPES } from "../src/types/event.ts";
import { demoState } from "./fixtures.mts";

const state = demoState;

test("every local-planner reply is grounded and non-empty", () => {
  const ctx = buildContext(state);
  for (const prompt of [
    "Plan a wedding within 15 lakh",
    "Suggest a royal Rajasthani wedding theme",
    "Help me reduce my catering budget",
    "Create a 6-month wedding checklist",
    "Recommend decoration ideas for an outdoor evening wedding",
    "Build a wedding-day schedule",
    "something entirely unrelated",
  ]) {
    const reply = mockReply(prompt, ctx);
    assert.ok(reply.length > 120, `reply too short for "${prompt}"`);
    // Plain prose only: the chat panel renders text, not markdown.
    assert.ok(!/[*#`]/.test(reply), `reply contains markdown for "${prompt}"`);
  }
});

test("every local generation validates against the model contract", () => {
  // Every occasion × every documented prompt — a category name that only
  // suits a wedding would fail here rather than at runtime.
  for (const type of EVENT_TYPES) {
    const ctx = buildContext(createDemoState(type));
    for (const prompt of EVENT_THEMES[type].suggestions) {
      const gen = mockGeneration(prompt, ctx);
      const parsed = GenerationSchema.safeParse(gen);
      assert.ok(parsed.success, `${type} / "${prompt}": ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
      assert.ok(
        gen.tasks.length + gen.ideas.length + gen.budgetLines.length > 0,
        `${type} / "${prompt}" produced nothing to apply`,
      );
      const reply = mockReply(prompt, ctx);
      assert.ok(reply.length > 120, `${type} / "${prompt}": reply too short`);
      assert.ok(!/[*#`]/.test(reply), `${type} / "${prompt}": reply contains markdown`);
    }
  }

  const ctx = buildContext(state);
  for (const prompt of [
    "Create a 6-month wedding checklist",
    "Suggest a royal Rajasthani wedding theme",
    "Help me reduce my catering budget",
    "Build a wedding-day schedule",
    "Plan a budget split",
  ]) {
    const gen = mockGeneration(prompt, ctx);
    const parsed = GenerationSchema.safeParse(gen);
    assert.ok(parsed.success, `"${prompt}": ${JSON.stringify(parsed.error?.issues?.slice(0, 3))}`);
    assert.ok(
      gen.tasks.length + gen.ideas.length + gen.budgetLines.length > 0,
      `"${prompt}" produced nothing to apply`,
    );
    for (const line of gen.budgetLines) {
      assert.ok(
        (BUDGET_CATEGORIES as readonly string[]).includes(line.category),
        `unknown budget category ${line.category}`,
      );
    }
  }
});

test("one occasion never borrows another occasion's vocabulary", () => {
  // A birthday plan that talks about a mandap is the bug this catches: the
  // local planner started life wedding-only and the wording leaked.
  const WEDDING_ONLY = /(wedding|mandap|baraat|phere|bridal|sangeet|vidaai)/i;
  for (const type of EVENT_TYPES) {
    if (type === "wedding") continue;
    const ctx = buildContext(createDemoState(type));
    for (const prompt of EVENT_THEMES[type].suggestions) {
      const reply = mockReply(prompt, ctx);
      const m1 = reply.match(WEDDING_ONLY);
      assert.ok(!m1, `${type} reply to "${prompt}" says "${m1?.[0]}"`);

      const gen = mockGeneration(prompt, ctx);
      const text = [gen.headline, gen.summary, ...gen.tasks.map((t) => t.title), ...gen.ideas.map((i) => `${i.title} ${i.note}`)].join(" ");
      const m2 = text.match(WEDDING_ONLY);
      assert.ok(!m2, `${type} generation for "${prompt}" says "${m2?.[0]}"`);
    }
  }
});

test("intent classification routes the documented prompts", () => {
  assert.equal(classify("Help me reduce my catering budget"), "reduce-budget");
  assert.equal(classify("Create a 6-month wedding checklist"), "checklist");
  assert.equal(classify("Suggest a royal Rajasthani wedding theme"), "theme");
  assert.equal(classify("Build a wedding-day schedule"), "schedule");
});
