import { createDemoState } from "../src/data/events/index.ts";

/**
 * The shared sample plan.
 *
 * Built once so every suite measures the same thing, and so a change to the
 * wedding template shows up as one diff rather than six.
 */
export const demoState = createDemoState("wedding");
