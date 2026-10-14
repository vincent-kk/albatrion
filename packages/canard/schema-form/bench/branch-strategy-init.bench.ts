import { bench, describe } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

/** Blueprint compilation and initial settlement through the core entry, varying branch fan-out. */

function makeOneOf(branchCount: number, childrenPerBranch: number): JSONSchema {
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
      controls: { active: `./type === 't${i}'` },
      properties: Object.fromEntries(
        Array.from({ length: childrenPerBranch }, (_, j) => [
          `f${i}_${j}`,
          { type: 'string' as const, default: `v${i}_${j}` },
        ]),
      ),
    })),
  };
}

function makeNestedOneOf(depth: number): JSONSchema {
  let inner: JSONSchema = {
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
          controls: { active: "./type === 'a'" },
          properties: { nested: inner },
        },
        {
          controls: { active: "./type === 'b'" },
          properties: { other: { type: 'string', default: 'other' } },
        },
      ],
    } as JSONSchema;
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

describe('blueprint/load: branch initialization through core', () => {
  bench('oneOf 2 branches × 3 children', () => {
    nodeFromJSONSchema({ jsonSchema: oneOf_2x3, onChange: noop });
  });

  bench('oneOf 5 branches × 3 children', () => {
    nodeFromJSONSchema({ jsonSchema: oneOf_5x3, onChange: noop });
  });

  bench('oneOf 2 branches × 10 children', () => {
    nodeFromJSONSchema({ jsonSchema: oneOf_2x10, onChange: noop });
  });

  bench('oneOf 10 branches × 10 children (heavy)', () => {
    nodeFromJSONSchema({ jsonSchema: oneOf_10x10, onChange: noop });
  });

  bench('nested oneOf depth 3', () => {
    nodeFromJSONSchema({ jsonSchema: nested_3, onChange: noop });
  });

  bench('nested oneOf depth 5', () => {
    nodeFromJSONSchema({ jsonSchema: nested_5, onChange: noop });
  });
});
