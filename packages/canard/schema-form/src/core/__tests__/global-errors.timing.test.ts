import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import {
  type ValidationIssue,
  ValidationMode,
} from '@/schema-form/core/engine';
import { type FieldNode } from '@/schema-form/core/surface';

/** Keep field count fixed to isolate scaling in the root issue list. */
const FIELDS = 20;
const ISSUES = 100;

/**
 * Build a flat object tree whose root holds external issues spread over its fields.
 * @param fields - Number of string fields
 * @param issues - Number of external issues spread round-robin over the fields
 * @returns The root, its field nodes, and the external list placed at the root and by path.
 */
const createLoadedRoot = (
  fields: number,
  issues: number,
): { root: FieldNode; fields: FieldNode[]; external: ValidationIssue[] } => {
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
  const nodes: FieldNode[] = [];
  root.batch(() => {
    root.setExternalErrors(external);
    for (const [path, group] of groups) {
      const field = root.find(path)!;
      nodes.push(field);
      field.setExternalErrors(group);
    }
  });
  expect(root.errors).toBe(external);
  return { root, fields: nodes, external };
};

/**
 * Count membership probes of the actual root issues, excluding other runtime sets.
 * @param clear - Clears each field, either inside a batch or independently.
 * @returns Counts at n and 4n issues with a fixed field count.
 */
const measure = (
  clear: (root: FieldNode, fields: FieldNode[]) => void,
): { small: number; large: number } => {
  const count = (scale: number): number => {
    const { root, fields, external } = createLoadedRoot(FIELDS, ISSUES * scale);
    const issues = new WeakSet<object>(external);
    const originalHas = Set.prototype.has;
    let probes = 0;
    // Restore synchronously: instrumentation covers only this clearing operation.
    Set.prototype.has = function (value: unknown) {
      if (typeof value === 'object' && value !== null && issues.has(value))
        probes++;
      return originalHas.call(this, value);
    };
    try {
      clear(root, fields);
    } finally {
      Set.prototype.has = originalHas;
    }
    expect(root.errors).toEqual([]);
    for (const field of fields) expect(field.errors).toEqual([]);
    return probes;
  };
  return { small: count(1), large: count(4) };
};

describe('external error propagation work', () => {
  it('clears fields holding root issues inside one batch in linear work', () => {
    const { small, large } = measure((root, fields) => {
      root.batch(() => {
        for (const field of fields) field.clearExternalErrors();
      });
    });
    // placed and retired each inspect every issue once in the single rebuild.
    expect(small).toBe(2 * ISSUES);
    expect(large).toBe(4 * small);
  });

  it('clears fields holding root issues one call at a time in linear work', () => {
    const { small, large } = measure((_root, fields) => {
      for (const field of fields) field.clearExternalErrors();
    });
    // Each call scans the remaining list; fixed FIELDS gives a linear sum in ISSUES.
    expect(small).toBe((FIELDS + 1) * ISSUES);
    expect(large).toBe(4 * small);
  });
});
