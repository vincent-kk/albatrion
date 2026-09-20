import { bench, describe } from 'vitest';

import {
  type NumberNode,
  type ObjectNode,
  nodeFromJSONSchema,
} from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

/**
 * Object value reads around a pending child write — the cost of reading a
 * parent object while its child's batched commit is still queued, against the
 * same writes with no read, the ancestor walk of a same-value write, and form
 * construction.
 */

/** Nests `leaf` under `depth` object levels named `next`. */
function makeDeepSchema(depth: number): JSONSchema {
  let inner: JSONSchema = {
    type: 'object',
    properties: { leaf: { type: 'number', default: 1 } },
  };
  for (let d = 0; d < depth; d++)
    inner = { type: 'object', properties: { next: inner } } as JSONSchema;
  return inner;
}

/** A root holding one object of `fanout` number fields. */
function makeGroupSchema(fanout: number): JSONSchema {
  return {
    type: 'object',
    properties: {
      group: {
        type: 'object',
        properties: Object.fromEntries(
          Array.from({ length: fanout }, (_, i) => [
            `field_${i}`,
            { type: 'number' as const, default: 0 },
          ]),
        ),
      },
    },
  };
}

const noop = () => {};

/**
 * Drains the event cascade once per iteration: the cascade's loop guard resets
 * on a macrotask, so a lane that never yields one fails. The timer floor is a
 * fixed cost, amortised by doing `BATCH` operations before each drain.
 */
const drain = () => new Promise<void>((r) => setTimeout(r, 0));
const BATCH = 1000;

const form = nodeFromJSONSchema({
  jsonSchema: makeGroupSchema(8),
  onChange: noop,
});
const group = form.find('/group') as ObjectNode;
const field = form.find('/group/field_0') as NumberNode;
let counter = 0;

const leafAt = (depth: number) => {
  const node = nodeFromJSONSchema({
    jsonSchema: makeDeepSchema(depth),
    onChange: noop,
  });
  return node.find('/' + 'next/'.repeat(depth) + 'leaf') as NumberNode;
};
const leaf2 = leafAt(2);
const leaf8 = leafAt(8);
const leaf16 = leafAt(16);
const wide50 = makeGroupSchema(50);

/** Repeats the value a leaf already holds `BATCH` times, then drains. */
const repeatSameValue = (leaf: NumberNode) => async () => {
  for (let i = 0; i < BATCH; i++) leaf.setValue(1);
  await drain();
};

describe('object pending read', () => {
  bench(
    `${BATCH} × (child write + 1 parent value read) + drain`,
    async () => {
      for (let i = 0; i < BATCH; i++) {
        field.setValue(++counter);
        void group.value;
      }
      await drain();
    },
    { time: 1500 },
  );

  bench(
    `${BATCH} × (child write + 3 parent value reads) + drain`,
    async () => {
      for (let i = 0; i < BATCH; i++) {
        field.setValue(++counter);
        void group.value;
        void group.value;
        void group.value;
      }
      await drain();
    },
    { time: 1500 },
  );

  bench(
    `${BATCH} × child write, no read + drain`,
    async () => {
      for (let i = 0; i < BATCH; i++) field.setValue(++counter);
      await drain();
    },
    { time: 1500 },
  );

  bench(
    `${BATCH} × same-value write at depth 2 + drain`,
    repeatSameValue(leaf2),
    {
      time: 1000,
    },
  );

  bench(
    `${BATCH} × same-value write at depth 8 + drain`,
    repeatSameValue(leaf8),
    {
      time: 1000,
    },
  );

  bench(
    `${BATCH} × same-value write at depth 16 + drain`,
    repeatSameValue(leaf16),
    { time: 1000 },
  );

  bench('create a 50-field form', () => {
    nodeFromJSONSchema({ jsonSchema: wide50, onChange: noop });
  });
});
