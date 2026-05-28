import { bench, describe } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

/**
 * BranchStrategy initialization cost — measured via nodeFromJsonSchema with
 * oneOf-heavy schemas. Isolates the cost of `__primeInitialBranch__()` +
 * `__processChildren__()` (the path race-fix #318 touches) as the schema's
 * branch count / branch fan-out scales.
 *
 * Use this bench to validate whether the race fix's mount overhead is
 * O(branches × children) or O(active branch only).
 */

function makeOneOf(branchCount: number, childrenPerBranch: number): JsonSchema {
  return {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: Array.from({ length: branchCount }, (_, i) => `t${i}`),
        default: 't0',
      },
    },
    oneOf: Array.from({ length: branchCount }, (_, i) => ({
      '&if': `./type === 't${i}'`,
      properties: Object.fromEntries(
        Array.from({ length: childrenPerBranch }, (_, j) => [
          `f${i}_${j}`,
          { type: 'string' as const, default: `v${i}_${j}` },
        ]),
      ),
    })),
  };
}

function makeNestedOneOf(depth: number): JsonSchema {
  let inner: JsonSchema = {
    type: 'object',
    properties: { leaf: { type: 'string', default: 'leaf' } },
  };
  for (let d = 0; d < depth; d++) {
    inner = {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['a', 'b'], default: 'a' },
      },
      oneOf: [
        {
          '&if': "./type === 'a'",
          properties: { nested: inner },
        },
        {
          '&if': "./type === 'b'",
          properties: { other: { type: 'string', default: 'other' } },
        },
      ],
    } as JsonSchema;
  }
  return inner;
}

const noop = () => {};

const oneOf_2x3 = makeOneOf(2, 3);
const oneOf_5x3 = makeOneOf(5, 3);
const oneOf_2x10 = makeOneOf(2, 10);
const oneOf_10x10 = makeOneOf(10, 10);
const nested_3 = makeNestedOneOf(3);
const nested_5 = makeNestedOneOf(5);

describe('BranchStrategy init (via nodeFromJsonSchema)', () => {
  bench('oneOf 2 branches × 3 children', () => {
    nodeFromJsonSchema({ jsonSchema: oneOf_2x3, onChange: noop });
  });

  bench('oneOf 5 branches × 3 children', () => {
    nodeFromJsonSchema({ jsonSchema: oneOf_5x3, onChange: noop });
  });

  bench('oneOf 2 branches × 10 children', () => {
    nodeFromJsonSchema({ jsonSchema: oneOf_2x10, onChange: noop });
  });

  bench('oneOf 10 branches × 10 children (heavy)', () => {
    nodeFromJsonSchema({ jsonSchema: oneOf_10x10, onChange: noop });
  });

  bench('nested oneOf depth 3', () => {
    nodeFromJsonSchema({ jsonSchema: nested_3, onChange: noop });
  });

  bench('nested oneOf depth 5', () => {
    nodeFromJsonSchema({ jsonSchema: nested_5, onChange: noop });
  });
});
