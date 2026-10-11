import { bench, describe } from 'vitest';

import {
  type NumberNode,
  type SchemaNode,
  type StringNode,
  nodeFromJSONSchema,
} from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

/**
 * Dispatch hot path — public `setValue` through synchronous settlement and delivery.
 *
 * The legacy drain is retained as a control for the saved baseline:
 *  - A single `setValue + setTimeout(0)` is dominated by the ~1ms macrotask
 *    timer floor, NOT schema-form cost (the "drain dominant" problem).
 *
 * Resolution: the `flat batch` lane fires K setValues on DISTINCT fields
 * (no re-entrancy) then drains ONCE, so the fixed ~1ms timer floor is
 * amortized over K and the per-setValue schema-form cost is recoverable as
 * (mean - floor) / K. `derived` and `oneOf` are inherently single-op, so
 * they stay timer-floor-bound and are kept only for relative comparison.
 *
 * Nodes are built once at module load — `nodeFromJSONSchema` is NOT in the
 * measured path (that is `branch-strategy-init.bench.ts`'s job).
 */

const FIELD_COUNT = 20;
const BATCH = 10; // distinct fields mutated per drain

const flatSchema: JSONSchema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: FIELD_COUNT }, (_, i) => [
      `f${i}`,
      { type: 'string' as const, default: '' },
    ]),
  ),
};

const derivedSchema: JSONSchema = {
  type: 'object',
  properties: {
    a: { type: 'number', default: 0 },
    b: { type: 'number', default: 0 },
    sum: { type: 'number', controls: { derived: '../a + ../b' } },
    twice: { type: 'number', controls: { derived: '../sum * 2' } },
    label: { type: 'string', controls: { derived: '"v=" + ../twice' } },
  },
};

const oneOfSchema: JSONSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['a', 'b'], default: 'a' },
  },
  oneOf: [
    {
      controls: { active: "./type === 'a'" },
      properties: {
        x: { type: 'string', default: 'A' },
        y: { type: 'number', default: 1 },
      },
    },
    {
      controls: { active: "./type === 'b'" },
      properties: {
        x: { type: 'string', default: 'B' },
        y: { type: 'number', default: 2 },
      },
    },
  ],
};

const noop = () => {};
const drain = () => new Promise<void>((r) => setTimeout(r, 0));

const flatNode: SchemaNode = nodeFromJSONSchema({
  jsonSchema: flatSchema,
  onChange: noop,
});
const derivedNode: SchemaNode = nodeFromJSONSchema({
  jsonSchema: derivedSchema,
  onChange: noop,
});
const oneOfNode: SchemaNode = nodeFromJSONSchema({
  jsonSchema: oneOfSchema,
  onChange: noop,
});

let counter = 0;
let oneOfToggle = false;

if (
  !flatNode.find('/f0') ||
  !derivedNode.find('/label') ||
  !oneOfNode.find('/x')
)
  throw new Error(
    'dispatch benchmark requires mounted flat, derived and branch fields',
  );

describe('dispatch: public writes (legacy macrotask drain retained)', () => {
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
