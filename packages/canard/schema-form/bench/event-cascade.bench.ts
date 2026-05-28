import { bench, describe } from 'vitest';

import {
  type NumberNode,
  type SchemaNode,
  type StringNode,
  nodeFromJsonSchema,
} from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

/**
 * Event cascade hot path — `setValue` → cascade → subscribers.
 *
 * Design notes (learned the hard way):
 *  - schema-form's cascade is fundamentally async: `setValue` queues work
 *    that is flushed on a macrotask. Calling `setValue` repeatedly WITHOUT
 *    draining (a "sync only" lane) piles up cascades and triggers a
 *    re-entrancy error in `__processChildren__`. So every lane MUST drain.
 *  - A single `setValue + setTimeout(0)` is dominated by the ~1ms macrotask
 *    timer floor, NOT schema-form cost (the "drain dominant" problem).
 *
 * Resolution: the `flat batch` lane fires K setValues on DISTINCT fields
 * (no re-entrancy) then drains ONCE, so the fixed ~1ms timer floor is
 * amortized over K and the per-setValue schema-form cost is recoverable as
 * (mean - floor) / K. `derived` and `oneOf` are inherently single-op, so
 * they stay timer-floor-bound and are kept only for relative comparison.
 *
 * Nodes are built once at module load — `nodeFromJsonSchema` is NOT in the
 * measured path (that is `branch-strategy-init.bench.ts`'s job).
 */

const FIELD_COUNT = 20;
const BATCH = 10; // distinct fields mutated per drain

const flatSchema: JsonSchema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: FIELD_COUNT }, (_, i) => [
      `f${i}`,
      { type: 'string' as const, default: '' },
    ]),
  ),
};

const derivedSchema: JsonSchema = {
  type: 'object',
  properties: {
    a: { type: 'number', default: 0 },
    b: { type: 'number', default: 0 },
    sum: { type: 'number', computed: { derived: '../a + ../b' } },
    twice: { type: 'number', computed: { derived: '../sum * 2' } },
    label: { type: 'string', computed: { derived: '"v=" + ../twice' } },
  },
};

const oneOfSchema: JsonSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['a', 'b'], default: 'a' },
  },
  oneOf: [
    {
      '&if': "./type === 'a'",
      properties: {
        x: { type: 'string', default: 'A' },
        y: { type: 'number', default: 1 },
      },
    },
    {
      '&if': "./type === 'b'",
      properties: {
        x: { type: 'string', default: 'B' },
        y: { type: 'number', default: 2 },
      },
    },
  ],
};

const noop = () => {};
const drain = () => new Promise<void>((r) => setTimeout(r, 0));

const flatNode: SchemaNode = nodeFromJsonSchema({
  jsonSchema: flatSchema,
  onChange: noop,
});
const derivedNode: SchemaNode = nodeFromJsonSchema({
  jsonSchema: derivedSchema,
  onChange: noop,
});
const oneOfNode: SchemaNode = nodeFromJsonSchema({
  jsonSchema: oneOfSchema,
  onChange: noop,
});

let counter = 0;
let oneOfToggle = false;

describe('event cascade (macrotask drain)', () => {
  bench(
    `flat batch: ${BATCH} setValue on distinct fields + 1 drain`,
    async () => {
      counter++;
      for (let i = 0; i < BATCH; i++) {
        (flatNode.find(`f${i}`) as StringNode | null)?.setValue(
          `v${counter}_${i}`,
        );
      }
      await drain();
    },
    { time: 1500 },
  );

  bench(
    'derived chain (a→sum→twice→label): 1 setValue + drain',
    async () => {
      (derivedNode.find('a') as NumberNode | null)?.setValue(counter++ % 1000);
      await drain();
    },
    { time: 1000 },
  );

  bench(
    'oneOf branch switch (a↔b): 1 setValue + drain',
    async () => {
      oneOfToggle = !oneOfToggle;
      (oneOfNode.find('type') as StringNode | null)?.setValue(
        oneOfToggle ? 'b' : 'a',
      );
      await drain();
    },
    { time: 1000 },
  );
});
