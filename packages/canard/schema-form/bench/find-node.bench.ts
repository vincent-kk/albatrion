import { bench, describe } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

/**
 * findNode hot path — variant-aware traversal cost as path depth and
 * sibling fan-out scale. Driver for `subnodes` linear scan suspicion
 * raised in the design review.
 */

function makeDeepSchema(depth: number): JsonSchema {
  let inner: JsonSchema = {
    type: 'object',
    properties: { leaf: { type: 'string', default: 'leaf' } },
  };
  for (let d = 0; d < depth; d++) {
    inner = {
      type: 'object',
      properties: { next: inner },
    } as JsonSchema;
  }
  return inner;
}

function makeWideSchema(fanout: number): JsonSchema {
  return {
    type: 'object',
    properties: Object.fromEntries(
      Array.from({ length: fanout }, (_, i) => [
        `field_${i}`,
        { type: 'string' as const, default: '' },
      ]),
    ),
  };
}

const noop = () => {};

const depth3 = nodeFromJsonSchema({
  jsonSchema: makeDeepSchema(3),
  onChange: noop,
});
const depth7 = nodeFromJsonSchema({
  jsonSchema: makeDeepSchema(7),
  onChange: noop,
});
const depth12 = nodeFromJsonSchema({
  jsonSchema: makeDeepSchema(12),
  onChange: noop,
});
const wide10 = nodeFromJsonSchema({
  jsonSchema: makeWideSchema(10),
  onChange: noop,
});
const wide50 = nodeFromJsonSchema({
  jsonSchema: makeWideSchema(50),
  onChange: noop,
});

const path3 = '/next/next/next/leaf';
const path7 = '/next/next/next/next/next/next/next/leaf';
const path12 =
  '/next/next/next/next/next/next/next/next/next/next/next/next/leaf';

describe('findNode', () => {
  bench('depth 3 (4 segments)', () => {
    depth3.find(path3);
  });

  bench('depth 7 (8 segments)', () => {
    depth7.find(path7);
  });

  bench('depth 12 (13 segments)', () => {
    depth12.find(path12);
  });

  bench('wide fanout 10 → last child', () => {
    wide10.find('/field_9');
  });

  bench('wide fanout 50 → last child', () => {
    wide50.find('/field_49');
  });

  bench('wide fanout 50 → first child', () => {
    wide50.find('/field_0');
  });
});
