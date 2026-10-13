import { describe, expect, it } from 'vitest';

import { median } from '@winglet/common-utils/math';

import {
  type SchemaNode,
  type ValidationIssue,
  ValidationMode,
  nodeFromJSONSchema,
} from '../index';

const FIELDS = 100;
const ISSUES = 1000;
/** Independent measurements per scale, each with a freshly loaded root. */
const SAMPLES = 5;
/** Floor for the small measurement so timer noise cannot fail the ratio (ms). */
const NOISE_FLOOR = 5;
/** Allowed ratio between the 4n and n timings; linear work gives 4. */
const LINEAR_RATIO = 8;

/**
 * Build a flat object tree whose root holds external issues spread over its fields.
 * @param fields - Number of string fields
 * @param issues - Number of external issues spread round-robin over the fields
 * @returns The root, its field nodes, and the external list placed at the root and by path.
 */
const createLoadedRoot = (
  fields: number,
  issues: number,
): { root: SchemaNode; fields: SchemaNode[] } => {
  const properties: Record<string, { type: 'string' }> = {};
  for (let index = 0; index < fields; index++)
    properties[`f${index}`] = { type: 'string' };
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties },
    validationMode: ValidationMode.None,
  });
  const external: ValidationIssue[] = [];
  const groups = new Map<string, ValidationIssue[]>();
  for (let index = 0; index < issues; index++) {
    const path = `/f${index % fields}`;
    const issue = { dataPath: path, message: `issue ${index}` };
    external.push(issue);
    (groups.get(path) ?? groups.set(path, []).get(path)!).push(issue);
  }
  const nodes: SchemaNode[] = [];
  root.batch(() => {
    root.setExternalErrors(external);
    for (const [path, group] of groups) {
      const field = root.find(path)!;
      nodes.push(field);
      field.setExternalErrors(group);
    }
  });
  expect(root.errors).toBe(external);
  return { root, fields: nodes };
};

/**
 * Sample one clearing strategy SAMPLES times at n and 4n, using a fresh root per sample.
 * @param clear - Clears every field of a loaded root
 * @returns Median elapsed milliseconds for the n and the 4n tree
 */
const measure = (
  clear: (root: SchemaNode, fields: SchemaNode[]) => void,
): { small: number; large: number } => {
  const time = (scale: number): number => {
    const samples: number[] = [];
    for (let sample = 0; sample < SAMPLES; sample++) {
      const { root, fields } = createLoadedRoot(FIELDS * scale, ISSUES * scale);
      const start = performance.now();
      clear(root, fields);
      samples.push(performance.now() - start);
      expect(root.errors).toEqual([]);
    }
    return median(samples);
  };
  return { small: time(1), large: time(4) };
};

describe('external error propagation timing (188C-01 record)', () => {
  it('clears fields holding root issues inside one batch in linear time', () => {
    const { small, large } = measure((root, fields) => {
      root.batch(() => {
        for (const field of fields) field.clearExternalErrors();
      });
    });
    expect(large).toBeLessThan(Math.max(small, NOISE_FLOOR) * LINEAR_RATIO);
  });

  it('clears fields holding root issues one call at a time in linear time', () => {
    const { small, large } = measure((_root, fields) => {
      for (const field of fields) field.clearExternalErrors();
    });
    expect(large).toBeLessThan(Math.max(small, NOISE_FLOOR) * LINEAR_RATIO);
  });
});
