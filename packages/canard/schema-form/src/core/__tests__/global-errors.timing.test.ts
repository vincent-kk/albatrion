import { describe, expect, it } from 'vitest';

import {
  type SchemaNode,
  type ValidationIssue,
  ValidationMode,
  nodeFromJSONSchema,
} from '../index';

const FIELDS = 100;
const ISSUES = 1000;

/**
 * Build a flat object tree whose root holds 1,000 external issues spread over 100 fields.
 * @returns The root, its field nodes, and the external list placed at the root and by path.
 */
const createLoadedRoot = (): { root: SchemaNode; fields: SchemaNode[] } => {
  const properties: Record<string, { type: 'string' }> = {};
  for (let index = 0; index < FIELDS; index++)
    properties[`f${index}`] = { type: 'string' };
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties },
    validationMode: ValidationMode.None,
  });
  const external: ValidationIssue[] = [];
  const groups = new Map<string, ValidationIssue[]>();
  for (let index = 0; index < ISSUES; index++) {
    const path = `/f${index % FIELDS}`;
    const issue = { dataPath: path, message: `issue ${index}` };
    external.push(issue);
    (groups.get(path) ?? groups.set(path, []).get(path)!).push(issue);
  }
  const fields: SchemaNode[] = [];
  root.batch(() => {
    root.setExternalErrors(external);
    for (const [path, group] of groups) {
      const field = root.find(path)!;
      fields.push(field);
      field.setExternalErrors(group);
    }
  });
  expect(root.errors).toBe(external);
  return { root, fields };
};

describe('external error propagation timing (188C-01 record)', () => {
  it('clears 100 fields holding 1,000 root issues inside one batch in linear time', () => {
    const { root, fields } = createLoadedRoot();
    const start = performance.now();
    root.batch(() => {
      for (const field of fields) field.clearExternalErrors();
    });
    const elapsed = performance.now() - start;
    expect(root.errors).toEqual([]);
    expect(elapsed).toBeLessThan(50);
  });

  it('clears 100 fields holding 1,000 root issues one call at a time within the same bound', () => {
    const { root, fields } = createLoadedRoot();
    const start = performance.now();
    for (const field of fields) field.clearExternalErrors();
    const elapsed = performance.now() - start;
    expect(root.errors).toEqual([]);
    expect(elapsed).toBeLessThan(50);
  });
});
