import { readFileSync } from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { blueprint } from '../blueprint';
import type { BlueprintSchema } from '../type';
import { mergeEffectiveSchema } from '../utils/effectiveSchema/mergeEffectiveSchema';
import * as constraints from '../utils/effectiveSchema/utils/applyConstraintKeywords';
import { mergeSchemaContributions } from '../utils/effectiveSchema/utils/mergeSchemaContributions';
import { selectEffectiveDeclarations } from '../utils/effectiveSchema/utils/selectEffectiveDeclarations';

const head: { cases: { label: string; schema: BlueprintSchema }[] } = JSON.parse(
  readFileSync(new URL('./fixtures/coldBindingHead.json', import.meta.url), 'utf8'),
);

afterEach(() => vi.restoreAllMocks());

describe('single static contribution regression records', () => {
  it('matches every node of the 59-schema HEAD corpus, including key order', () => {
    expect(head.cases).toHaveLength(59);
    for (const sample of head.cases) {
      let result;
      try { result = blueprint(structuredClone(sample.schema)); } catch (cause) {
        expect((cause as Error).name, sample.label).toBe('JSONSchemaError');
        continue;
      }
      for (const node of result.nodes) {
        const declarations = selectEffectiveDeclarations(node, [],
          node.declarations.filter(entry => entry.context === 'conjunction'));
        const actual = mergeSchemaContributions(node, declarations, { mode: 'static' });
        // Runtime mode retains HEAD's generic fold, with the same static anchor and selection.
        const reference = mergeSchemaContributions(node, declarations, { mode: 'runtime' });
        expect(actual, sample.label + node.path).toEqual(reference);
        expect(Object.keys(actual.schema), sample.label + node.path)
          .toEqual(Object.keys(reference.schema));
        expect(Object.isFrozen(actual)).toBe(true);
        expect(Object.isFrozen(actual.schema)).toBe(true);
      }
    }
  });

  it('removes one generic constraint traversal per eligible node', () => {
    const calls = vi.spyOn(constraints, 'applyConstraintKeywords');
    const properties: Record<string, BlueprintSchema> = {};
    for (let index = 0; index < 25; index++) properties[`field_${index}`] = { type: 'string' };
    const result = blueprint({ type: 'object', properties });
    expect(result.nodes).toHaveLength(26);
    expect(calls).toHaveBeenCalledTimes(0);
  });

  it('keeps hint policies, insertion order, raw references and existing memo isolation', () => {
    const presentation = { label: 'name' }, payload = { opaque: true };
    const schema = { title: 'first', type: 'object', required: ['a', 'a'],
      properties: { a: { type: 'string' } }, controls: { watch: 'a', default: 'value' },
      readOnly: false, presentation, payload, omitted: undefined } as Exclude<BlueprintSchema, boolean>;
    const node = blueprint(schema).root;
    const effective = mergeEffectiveSchema(node, []);
    const reference = mergeEffectiveSchema(node, [], {}, new WeakMap());
    expect(effective).toEqual(reference);
    expect(Object.keys(effective.schema)).toEqual(Object.keys(reference.schema));
    const hints = effective.schema as Record<string, unknown>;
    expect(hints.presentation).toBe(presentation);
    expect(hints.payload).toBe(payload);
    expect(hints.properties).toBe(schema.properties);
    expect(hints.required).not.toBe(schema.required);
    expect(hints.controls).not.toBe(schema.controls);
    expect(mergeEffectiveSchema(node, [])).toBe(effective);
    expect(mergeEffectiveSchema(node, [node.declarations[0].id, 999])).toBe(effective);
    expect(reference).not.toBe(effective);
    expect(mergeEffectiveSchema(node, [], { mode: 'static' })).not.toBe(effective);
  });

  it('keeps generic validation for constraints, nullable, patterns, options and policies', () => {
    const calls = vi.spyOn(constraints, 'applyConstraintKeywords');
    for (const schema of [{ type: 'string', minLength: 1 }, { type: 'string', enum: [] },
      { type: 'number', minimum: 5, maximum: 3 }, { type: 'string', nullable: false },
      { type: 'string', pattern: '^a' }, { type: 'string', options: {} },
      { type: ['string'] }, { type: ['string', 'number'] }, { type: 'null' },
      { type: 'string', nullable: true }] as BlueprintSchema[]) {
      calls.mockClear();
      blueprint(schema);
      expect(calls).toHaveBeenCalledTimes(1);
    }
    for (const key of ['enum', 'const', 'multipleOf', 'minimum', 'maximum',
      'exclusiveMinimum', 'exclusiveMaximum', 'minLength', 'maxLength',
      'minItems', 'maxItems', 'minProperties', 'maxProperties', 'nullable', 'pattern', 'options']) {
      calls.mockClear();
      blueprint({ type: 'string', [key]: undefined });
      expect(calls, key).toHaveBeenCalledTimes(1);
    }
    for (const options of [{ collect: vi.fn() }, { isAtomic: () => false }]) {
      calls.mockClear(); blueprint({ type: 'string' }, options);
      expect(calls).toHaveBeenCalledTimes(1);
    }
    calls.mockClear();
    expect(() => blueprint({ type: 'invalid' } as unknown as BlueprintSchema)).toThrow();
    expect(calls).not.toHaveBeenCalled();
  });

  it('keeps ordered conjunctions and different gated oneOf selections separate', () => {
    const calls = vi.spyOn(constraints, 'applyConstraintKeywords');
    const combined = blueprint({ type: 'string', allOf: [{ title: 'overlay' }] }).root;
    expect(calls).toHaveBeenCalledTimes(2);
    const node = blueprint({ type: 'object', oneOf: [
      { controls: { active: true }, title: 'first', properties: { a: { type: 'string' } } },
      { controls: { active: false }, title: 'second', properties: { b: { type: 'string' } } },
    ] }).root;
    const gates = node.declarations.filter(entry => entry.gates.length);
    expect(gates).toHaveLength(2);
    const first = mergeEffectiveSchema(node, [gates[0].id]);
    const second = mergeEffectiveSchema(node, [gates[1].id]);
    expect(first).not.toBe(second);
    expect(first.schema).toMatchObject({ title: 'first' });
    expect(second.schema).toMatchObject({ title: 'second' });
    expect(mergeEffectiveSchema(node, [gates[0].id])).toBe(first);
    expect(mergeEffectiveSchema(combined, []).schema).toMatchObject({ title: 'overlay' });
  });
});
