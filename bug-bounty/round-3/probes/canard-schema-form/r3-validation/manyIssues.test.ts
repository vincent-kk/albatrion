import { plugin } from '@canard/schema-form-ajv8-plugin';
import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import type { ValidationIssue } from '@/schema-form/core/engine/validation';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

/**
 * A terminal array owns its whole value, so every item issue routes to the one array node.
 * Routing appends each issue with `[...previous, issue]`, which copies the node's list per issue.
 */
const terminalRows = {
  type: 'object',
  properties: {
    rows: {
      type: 'array',
      options: { terminal: true },
      items: { type: 'string', minLength: 3 },
    },
  },
} as const;

const issuesFor = (count: number): ValidationIssue[] =>
  Array.from({ length: count }, (_, index) => ({
    dataPath: '/rows/' + index,
    keyword: 'minLength',
    message: 'must NOT have fewer than 3 characters',
    schemaPath: '#/properties/rows/items/minLength',
  }));

/** Validate once with a validator that returns precomputed issues, and time the core alone. */
const timeCoreRouting = async (count: number) => {
  const issues = issuesFor(count);
  const root = nodeFromJSONSchema({
    jsonSchema: { ...terminalRows },
    defaultValue: { rows: Array.from({ length: count }, () => 'a') },
    validationMode: ValidationMode.OnRequest,
    validator: {
      compile: () => () => issues.map((issue) => ({ ...issue })),
      compileGuard: () => () => true,
    },
  });
  const started = performance.now();
  const result = await root.validate();
  const elapsed = performance.now() - started;
  const rows = root.find('/rows');
  return { elapsed, total: result.length, onRows: rows?.errors.length };
};

/** Same through the real AJV8 plugin, timing AJV separately. */
const timeAjvForm = async (count: number) => {
  const value = { rows: Array.from({ length: count }, () => 'a') };
  const root = nodeFromJSONSchema({
    jsonSchema: { ...terminalRows },
    defaultValue: value,
    validationMode: ValidationMode.OnRequest,
    validator: plugin.validator,
  });
  const started = performance.now();
  const result = await root.validate();
  const elapsed = performance.now() - started;
  return { elapsed, total: result.length, onRows: root.find('/rows')?.errors.length };
};

/** Control: same issue count with unresolvable paths, so nothing is appended to a node list. */
const timeUnroutable = async (count: number) => {
  const issues = Array.from({ length: count }, (_, index) => ({
    dataPath: '/missing/' + index,
    keyword: 'minLength',
  }));
  const root = nodeFromJSONSchema({
    jsonSchema: { ...terminalRows },
    defaultValue: { rows: ['a'] },
    validationMode: ValidationMode.OnRequest,
    validator: {
      compile: () => () => issues.map((issue) => ({ ...issue })),
      compileGuard: () => () => true,
    },
  });
  const started = performance.now();
  await root.validate();
  return performance.now() - started;
};

describe('r3-validation many issues on one node', () => {
  it('[control] unroutable issues of the same count scale linearly', async () => {
    await timeUnroutable(2_000);
    const base = await timeUnroutable(10_000);
    const big = await timeUnroutable(40_000);
    console.log(
      `[r3-validation] unroutable control: 10k ${base.toFixed(1)} ms, 40k ${big.toFixed(1)} ms, ratio ${(big / base).toFixed(1)}`,
    );
    expect(big / base).toBeLessThan(8);
  }, 120_000);

  it('routes every issue of a large terminal array to that array node', async () => {
    const small = await timeCoreRouting(1_000);
    expect(small.total).toBe(1_000);
    expect(small.onRows).toBe(1_000);
  });

  it('core routing time grows linearly with the issue count on one node (4x issues, < 8x time)', async () => {
    await timeCoreRouting(2_000); // warm up
    const base = await timeCoreRouting(10_000);
    const big = await timeCoreRouting(40_000);
    console.log(
      `[r3-validation] core routing: 10k issues ${base.elapsed.toFixed(1)} ms, 40k issues ${big.elapsed.toFixed(1)} ms, ratio ${(big.elapsed / base.elapsed).toFixed(1)}`,
    );
    expect(big.onRows).toBe(40_000);
    expect(big.elapsed / base.elapsed).toBeLessThan(8);
  }, 120_000);

  it('[measurement] AJV8 form validation of a terminal array with 20k invalid rows', async () => {
    await timeAjvForm(1_000);
    const base = await timeAjvForm(5_000);
    const big = await timeAjvForm(20_000);
    console.log(
      `[r3-validation] ajv8 form: 5k rows ${base.elapsed.toFixed(1)} ms, 20k rows ${big.elapsed.toFixed(1)} ms, ratio ${(big.elapsed / base.elapsed).toFixed(1)}`,
    );
    expect(big.onRows).toBe(20_000);
    expect(big.elapsed / base.elapsed).toBeLessThan(8);
  }, 120_000);
});
