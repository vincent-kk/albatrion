import { readFileSync } from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { captureBlueprintObservables } from '../../__tests__/fixtures/captureBlueprintObservables';
import { blueprint } from '../blueprint';
import type { BlueprintDiagnostic, BlueprintSchema } from '../type';

/** HEAD expectations derive from 89C-03; stack addresses vary by build and runner. */
const head: { corpus: number; edges: number;
  cases: { label: string; schema: BlueprintSchema; expected: unknown }[] } =
  JSON.parse(readFileSync(new URL('./fixtures/coldBindingHead.json', import.meta.url), 'utf8'));

afterEach(() => vi.restoreAllMocks());

describe('cold blueprint child declaration binding', () => {
  it('preserves the 59-schema 89C-03 HEAD structure, static errors and warnings', () => {
    expect(head.corpus).toBe(14);
    expect(head.edges).toBe(45);
    expect(head.cases).toHaveLength(59);
    for (const sample of head.cases) {
      const schema = structuredClone(sample.schema) as BlueprintSchema;
      const before = structuredClone(schema);
      const diagnostics: BlueprintDiagnostic[] = [];
      let actual;
      try {
        actual = { graph: captureBlueprintObservables(
          blueprint(schema, { collect: value => diagnostics.push(value) }),
        ), diagnostics };
      } catch (cause) {
        const error = cause as Error;
        actual = { error: { name: error.name, message: error.message,
          data: JSON.parse(JSON.stringify(error)) }, diagnostics };
      }
      expect(JSON.parse(JSON.stringify(actual,
        (key, value) => key === 'stack' ? undefined : value,
      )), sample.label).toEqual(sample.expected);
      expect(schema, sample.label).toEqual(before);
    }
  });

  it('counts declaration materializations and keeps every reachable declaration frozen', () => {
    const properties: Record<string, BlueprintSchema> = {};
    for (let index = 0; index < 25; index++)
      properties[`field_${index}`] = { type: 'string', default: String(index) };
    const frozen = vi.spyOn(Object, 'freeze');
    const result = blueprint({ type: 'object', properties });
    const declarations = frozen.mock.calls.filter(([value]) =>
      value !== null && typeof value === 'object' && 'fragmentId' in value,
    );
    expect(result.nodes).toHaveLength(26);
    const reachable = result.nodes.flatMap(node => [...node.declarations,
      ...node.childEntries.flatMap(entry => entry.declarations)]);
    const distinct = reachable.filter((value, index) => reachable.indexOf(value) === index);
    expect(declarations).toHaveLength(distinct.length);
    for (const entry of result.root.childEntries) {
      expect(entry.declarations).toEqual(entry.node.declarations);
      expect(Object.isFrozen(entry.declarations)).toBe(true);
      expect(Object.isFrozen(entry.declarations[0])).toBe(true);
      expect(Object.isFrozen(entry.declarations[0].gates)).toBe(true);
    }
  });

  it('rebinds shared reference templates to the second host without mutating the first', () => {
    const result = blueprint({ type: 'object', $defs: {
      shared: { type: 'object', properties: { leaf: { type: 'string' } } },
    }, properties: { first: { $ref: '#/$defs/shared' }, second: { $ref: '#/$defs/shared' } } });
    const [first, second] = result.root.childEntries;
    expect(first.node).toBe(second.node);
    expect(first.declarations[0].path).toBe('/first');
    expect(second.declarations[0].path).toBe('/second');
    expect(first.declarations[0].schemaPath).toBe('#/properties/first');
    expect(second.declarations[0].schemaPath).toBe('#/properties/second');
    expect(second.declarations).not.toBe(first.declarations);
    expect(Object.isFrozen(second.declarations)).toBe(true);
  });
});
