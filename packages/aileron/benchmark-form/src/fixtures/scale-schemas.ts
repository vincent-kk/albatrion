import type { JsonSchema } from '@canard/schema-form';

/**
 * Scale-dial fixtures for measuring schema-form cost as a function of
 * schema shape and size. Used by the v2 scale benchmarks.
 *
 * Each builder is deterministic — same input → identical schema object,
 * so benchmark runs across versions are directly comparable.
 */

/**
 * N flat string properties: `field_000 .. field_(N-1)`.
 *
 * Measures linear cost growth for the most common case (forms with many
 * sibling primitives). Defaults to string fields with a stable default
 * value so initialization is deterministic.
 */
export function buildFlatSchema(fieldCount: number): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  for (let i = 0; i < fieldCount; i++) {
    const key = `field_${String(i).padStart(3, '0')}`;
    properties[key] = { type: 'string', default: `value_${i}` };
  }
  return {
    type: 'object',
    properties,
  } as JsonSchema;
}

/**
 * Balanced n-ary tree of nested objects, depth × fanout.
 *
 * Total leaf primitives ≈ fanout^depth. Use small values: depth=3 fanout=4
 * is 64 leaves; depth=5 fanout=4 is 1024 leaves (heavy).
 */
export function buildNestedSchema(depth: number, fanout: number): JsonSchema {
  function buildLevel(currentDepth: number): JsonSchema {
    if (currentDepth === 0) {
      return { type: 'string', default: 'leaf' } as JsonSchema;
    }
    const properties: Record<string, JsonSchema> = {};
    for (let i = 0; i < fanout; i++) {
      properties[`n${i}`] = buildLevel(currentDepth - 1);
    }
    return { type: 'object', properties } as JsonSchema;
  }
  return buildLevel(depth);
}

/**
 * Single array property with `itemCount` pre-seeded items.
 *
 * Stresses ArrayNode init and per-item child construction. Each item
 * is a small object so the cost is dominated by ArrayNode bookkeeping
 * rather than per-leaf parsing.
 */
export function buildArraySchema(itemCount: number): JsonSchema {
  const defaultItems = Array.from({ length: itemCount }, (_, i) => ({
    id: `id-${i}`,
    name: `name-${i}`,
    active: i % 2 === 0,
  }));
  return {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        default: defaultItems,
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            active: { type: 'boolean' },
          },
        },
      },
    },
  } as JsonSchema;
}

/**
 * `branchCount` -branch oneOf with a discriminator-like `kind` field
 * and small per-branch payload. Stresses BranchStrategy.initialize.
 */
export function buildOneOfHeavySchema(branchCount: number): JsonSchema {
  const oneOf: JsonSchema[] = [];
  for (let i = 0; i < branchCount; i++) {
    oneOf.push({
      type: 'object',
      properties: {
        kind: { type: 'string', enum: [`kind_${i}`], default: `kind_${i}` },
        [`payload_${i}_a`]: { type: 'string', default: `a_${i}` },
        [`payload_${i}_b`]: { type: 'number', default: i },
        [`payload_${i}_c`]: { type: 'boolean', default: i % 2 === 0 },
      },
      required: ['kind'],
    } as JsonSchema);
  }
  return {
    type: 'object',
    properties: {
      common: { type: 'string', default: 'shared' },
    },
    oneOf,
  } as JsonSchema;
}

export interface ScaleCase {
  label: string;
  schema: JsonSchema;
}

export const FLAT_CASES: ScaleCase[] = [
  { label: 'flat-50', schema: buildFlatSchema(50) },
  { label: 'flat-100', schema: buildFlatSchema(100) },
  { label: 'flat-500', schema: buildFlatSchema(500) },
];

export const NESTED_CASES: ScaleCase[] = [
  { label: 'nested-d3-f4', schema: buildNestedSchema(3, 4) },
  { label: 'nested-d5-f4', schema: buildNestedSchema(5, 4) },
];

export const ARRAY_CASES: ScaleCase[] = [
  { label: 'array-100', schema: buildArraySchema(100) },
  { label: 'array-500', schema: buildArraySchema(500) },
  { label: 'array-1000', schema: buildArraySchema(1000) },
];

export const ONEOF_HEAVY_CASES: ScaleCase[] = [
  { label: 'oneOf-5', schema: buildOneOfHeavySchema(5) },
  { label: 'oneOf-10', schema: buildOneOfHeavySchema(10) },
  { label: 'oneOf-20', schema: buildOneOfHeavySchema(20) },
];
