import type { CompositeCase } from "./types";

/** Number of fields; the gate threshold below defers most of them. */
const fieldCount = 100;

/** A hundred text fields. */
const wideSchema = {
  type: "object",
  properties: Object.fromEntries(
    Array.from({ length: fieldCount }, (_, index) => [
      `f${index}`,
      { type: "string" },
    ]),
  ),
};

/** CX-12: edited and touched follow a deferred field through a handle write, a focus reveal, a blur and reset. */
export const cx12DeferredEditedTouched: CompositeCase = {
  scenario: {
    name: "composite.cx12-deferred-edited-touched",
    description:
      "A hundred fields under virtualization (threshold 20): a deferred field accepts a handle write before it mounts (TEST-020); the tail checks that focus mounts it, that typing makes it edited but not touched, that a blur makes it touched (GOAL-061), and that reset clears both (CONTROLS-029).",
    schema: wideSchema,
    initialValue: {},
    steps: [
      {
        action: "batch",
        steps: [{ action: "setValue", path: "/f90", value: "far" }],
        expect: { values: { "/f90": "far" } },
      },
      { action: "reset", expect: { values: { "/f90": undefined } } },
    ],
  },
  props: {
    virtualization: {
      threshold: 20,
      eagerCount: 5,
      rootMargin: "0px",
      backfill: "none",
      estimateHeight: 40,
    },
  },
  tailStart: {},
  tail: [
    { act: "mounted", mounted: { "/f90": false }, browserOnly: true },
    { act: "focus", path: "/f90" },
    { act: "mounted", mounted: { "/f90": true } },
    { act: "type", path: "/f90", text: "far" },
    { act: "states", states: { "/f90": { edited: true, touched: false } } },
    { act: "blur" },
    { act: "states", states: { "/f90": { edited: true, touched: true } } },
    { act: "reset" },
    { act: "states", states: { "/f90": { edited: false, touched: false } } },
  ],
};
