/**
 * Occasion themes and the validated chart palette they are not allowed to touch.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { ACCENTS, ACCENT_KEYS, EVENT_ORDER, EVENT_THEMES, MOTIFS, MOTIF_KEYS, motifUrl } from "../src/lib/eventThemes.ts";
import { BUDGET_CATEGORIES, EVENT_TYPES } from "../src/types/event.ts";

test("every occasion is themed, and the stylesheet agrees with the module", () => {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.equal(EVENT_ORDER.length, EVENT_TYPES.length, "an occasion is missing from the picker order");

  for (const type of EVENT_TYPES) {
    const theme = EVENT_THEMES[type];
    assert.ok(
      css.includes(`[data-event="${type}"]`),
      `globals.css has no rule for "${type}"`,
    );
    for (const hex of [theme.accent, theme.accentDeep, theme.accentTint]) {
      assert.ok(
        css.includes(hex),
        `${type}: ${hex} is in eventThemes.ts but not in globals.css — the two have drifted`,
      );
    }
    assert.ok(theme.suggestions.length >= 4, `${type}: too few assistant prompts`);
    assert.ok(theme.nouns.guestGroups.length >= 3, `${type}: too few guest groupings`);
    const url = motifUrl(type);
    assert.ok(url.startsWith('url("data:image/svg+xml,'), `${type}: bad motif URI`);
    assert.ok(!url.includes("<svg"), `${type}: motif was not URL-encoded`);
  }
});

test("every occasion accent clears 4.5:1 where it is used", () => {
  // The accent is drawn as text on the canvas and on a card, and carries
  // white text when it is a button background. All three must pass.
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  for (const type of EVENT_TYPES) {
    const { accent } = EVENT_THEMES[type];
    for (const [role, against] of [
      ["canvas", "#faf7f2"],
      ["card", "#ffffff"],
      ["white text on it", "#ffffff"],
    ] as const) {
      const r = ratio(accent, against);
      assert.ok(r >= 4.5, `${type}: accent ${accent} is only ${r.toFixed(2)}:1 on ${role}`);
    }
  }
});

test("occasion themes never re-tint the validated chart palette", () => {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  for (const block of css.split(":root").slice(1)) {
    const rule = block.slice(0, block.indexOf("}") + 1);
    if (!rule.includes("data-event")) continue;
    assert.ok(
      !/--series-\d/.test(rule),
      `an occasion rule redefines a chart series colour: ${rule.slice(0, 80)}`,
    );
    assert.ok(
      !/--canvas|--surface:/.test(rule),
      "an occasion rule changes the surface the palette was validated against",
    );
  }
});

test("every budget category has a validated chart colour", () => {
  const donut = readFileSync(new URL("../src/components/budget/BudgetDonut.tsx", import.meta.url), "utf8");
  for (const category of BUDGET_CATEGORIES) {
    assert.ok(
      donut.includes(`${category.includes(" ") ? `"${category}"` : category}:`),
      `no colour mapped for ${category}`,
    );
  }
});

test("the chart series are declared once and not re-tinted per theme", () => {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  for (let i = 1; i <= 8; i++) {
    const declarations = css.match(new RegExp(`--series-${i}:`, "g")) ?? [];
    assert.equal(
      declarations.length,
      1,
      `--series-${i} is declared ${declarations.length} times; the validated set must have exactly one definition`,
    );
  }
  assert.ok(css.includes("--series-other:"), "the Other/Miscellaneous neutral is missing");
});

test("every accent preset clears 4.5:1 in each role it is used for", () => {
  // Custom occasions pick from this set, so the contrast guarantee has to hold
  // for all of it — not just the seven the built-ins happen to use.
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  for (const key of ACCENT_KEYS) {
    const { accent } = ACCENTS[key];
    for (const [role, against] of [
      ["the canvas", "#faf7f2"],
      ["a card", "#ffffff"],
      ["white text on it", "#ffffff"],
    ] as const) {
      const r = ratio(accent, against);
      assert.ok(r >= 4.5, `${key}: ${accent} is only ${r.toFixed(2)}:1 against ${role}`);
    }
  }
});

test("every motif is a self-contained, mask-safe SVG", () => {
  for (const key of MOTIF_KEYS) {
    const { svg, label } = MOTIFS[key];
    assert.ok(svg.startsWith("<svg"), `${key}: not an svg`);
    assert.ok(svg.includes("xmlns="), `${key}: missing xmlns, will not load as a data URI`);
    assert.ok(svg.includes("viewBox="), `${key}: missing viewBox, will not scale`);
    // Masks read alpha only, so a motif must be drawn in a single flat colour.
    assert.ok(!/fill="#(?!000)/.test(svg), `${key}: motif uses a colour other than black`);
    assert.ok(label.length > 2, `${key}: needs a human-readable label for the picker`);
  }
});
