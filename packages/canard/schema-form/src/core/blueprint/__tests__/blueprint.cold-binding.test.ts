import { readFileSync } from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { captureBlueprintObservables } from '../../__tests__/fixtures/captureBlueprintObservables';
import { blueprint } from '../blueprint';
import type { BlueprintDiagnostic, BlueprintGate, BlueprintSchema } from '../type';
import * as templateKeys from '../utils/analyze/getTemplateKey';
import { getTemplateKeysHead } from './fixtures/getTemplateKeysHead';

/** HEAD expectations derive from 89C-03; stack addresses vary by build and runner. */
const head: { corpus: number; edges: number;
  cases: { label: string; schema: BlueprintSchema; expected: unknown }[] } =
  JSON.parse(readFileSync(new URL('./fixtures/coldBindingHead.json', import.meta.url), 'utf8'));

afterEach(() => vi.restoreAllMocks());

describe('cold blueprint child declaration binding', () => {
  it('keeps both actual lookup keys byte-identical to HEAD for all 59 schemas and reused templates', () => {
    const original = templateKeys.getTemplateKey;
    const checked = new WeakSet<object>();
    const expected = new WeakMap<object, { key: string; boundKey: string }>();
    let templateLookups = 0;
    let constructingLookups = 0;
    vi.spyOn(templateKeys, 'getTemplateKey').mockImplementation((context, inputs) => {
      const reference = getTemplateKeysHead(context, inputs);
      expected.set(context, reference);
      if (!checked.has(context)) {
        checked.add(context);
        const templatesGet = context.templates.get.bind(context.templates);
        const constructingGet = context.constructing.get.bind(context.constructing);
        vi.spyOn(context.templates, 'get').mockImplementation(key => {
          expect(key).toBe(expected.get(context)?.boundKey);
          templateLookups++;
          return templatesGet(key);
        });
        vi.spyOn(context.constructing, 'get').mockImplementation(key => {
          expect(key).toBe(expected.get(context)?.key);
          constructingLookups++;
          return constructingGet(key);
        });
      }
      const actual: unknown = original(context, inputs);
      expect(typeof actual === 'string' ? actual : (actual as { key: string }).key)
        .toBe(reference.key);
      if (typeof actual !== 'string')
        expect((actual as { boundKey: string }).boundKey).toBe(reference.boundKey);
      return actual as ReturnType<typeof original>;
    });
    expect(head.cases).toHaveLength(59);
    const reused: BlueprintSchema = { type: 'object', $defs: {
      shared: { type: 'object', properties: { 'quote"\\\n\ud800': { type: 'string' } } },
      recursive: { type: 'object', properties: { list: { type: 'array', items: { $ref: '#/$defs/recursive' } } } },
    }, properties: {
      first: { $ref: '#/$defs/shared' }, second: { $ref: '#/$defs/shared' },
      overlay: { $ref: '#/$defs/shared', allOf: [{ properties: { extra: { type: 'number' } } }] },
      recursion: { $ref: '#/$defs/recursive' },
    }, allOf: [{ controls: { active: true }, properties: { gated: { $ref: '#/$defs/shared' } } },
      { controls: { active: false }, properties: { gated: { $ref: '#/$defs/shared' } } }] };
    for (const schema of [...head.cases.map(sample => sample.schema), reused]) {
      try { blueprint(structuredClone(schema)); } catch (cause) {
        if (!(cause instanceof Error) || cause.name !== 'JSONSchemaError') throw cause;
      }
    }
    expect(templateLookups).toBeGreaterThan(59);
    expect(constructingLookups).toBeGreaterThan(59);
  });

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

  it('preserves ordered gate and owner deduplication, delimiter collisions and JSON escaping', () => {
    const original = templateKeys.getTemplateKey;
    let checked = false;
    vi.spyOn(templateKeys, 'getTemplateKey').mockImplementation((context, inputs) => {
      if (!checked) {
        checked = true;
        const owner: BlueprintGate = { kind: 'active', schemaPath: 'a,b',
          hostPath: '/owner', evaluationReads: [], condition: true };
        const gate: BlueprintGate = { kind: 'if', schemaPath: '#/quote"\\\n\ud800',
          hostPath: '/first"\\\t', evaluationReads: [], condition: {}, negated: true,
          appliesWhen: [owner, { ...owner, schemaPath: 'c' }, owner] };
        const collision = { ...gate, hostPath: '/second', appliesWhen: [
          { ...owner, schemaPath: 'a' }, { ...owner, schemaPath: 'b,c' },
        ] };
        const samples = [[], [{ ...inputs[0], gates: [gate, collision, gate,
          { ...gate, negated: false }, { ...gate, appliesWhen: [] }] }],
          [{ ...inputs[0], schemaPath: '#/escape"\\\r\n\t\b\f\u0000\ud800\udfff😀',
            context: 'declaration' as const, gates: [] },
          { ...inputs[0], gates: [collision, gate] }]];
        for (const sample of samples) {
          const reference = getTemplateKeysHead(context, sample);
          const before = structuredClone(sample);
          const actual: unknown = original(context, sample);
          expect(typeof actual === 'string' ? actual : (actual as { key: string }).key)
            .toBe(reference.key);
          if (typeof actual !== 'string')
            expect((actual as { boundKey: string }).boundKey).toBe(reference.boundKey);
          expect(sample).toEqual(before);
        }
      }
      return original(context, inputs);
    });
    blueprint({ type: 'string' });
    expect(checked).toBe(true);
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
