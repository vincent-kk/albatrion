// filid:contract owned-inline-public
// filid:contract owned-inline-memberships
import { createElement } from 'react';

import { describe, expect, it } from 'vitest';

import { type JSONSchema, nodeFromJSONSchema } from '../../index';
import { blueprint } from '../blueprint';
import type { BlueprintSchema } from '../type';
import { createBlueprintGate } from '../utils/analyze/createBlueprintGate';
import { mergeEffectiveSchema } from '../utils/effectiveSchema/mergeEffectiveSchema';
import { mergeSchemaContributions } from '../utils/effectiveSchema/utils/mergeSchemaContributions';
import { getFeatureNodeIndex } from '../utils/features/getFeatureNodeIndex/getFeatureNodeIndex';
import { getItemEntry } from '../utils/itemEntry/getItemEntry';
import { collectOwnedInlineRecords } from './fixtures/collectOwnedInlineRecords';
import { createEffectiveSchemaNode } from './fixtures/createEffectiveSchemaNode';
import corpus from './fixtures/ownedInlineHead.json';

/** Module selection matches producer environment selection. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

describe('owned-inline ownership and protection', () => {
  it('owns every membership in the corpus and gate/expression/virtual/lazy edge cases', () => {
    const extra: BlueprintSchema[] = [
      {
        type: 'object',
        controls: {
          active: true,
          children: [{ targets: ['a'], controls: { active: false } }],
        },
        properties: {
          a: { type: 'string' },
          arr: {
            type: 'array',
            items: { type: 'string', controls: { active: '../enabled' } },
          },
        },
        options: { virtual: { group: { fields: ['a'] } } },
        allOf: [
          { controls: { active: true }, properties: { a: { type: 'string' } } },
        ],
      },
      {
        type: 'object',
        $defs: {
          shared: {
            type: 'object',
            properties: {
              leaf: { type: 'string', controls: { visible: '../on === true' } },
            },
            controls: {
              active: true,
              children: [{ targets: ['leaf'], controls: { active: '../on' } }],
            },
          },
        },
        properties: {
          first: { $ref: '#/$defs/shared' },
          second: { $ref: '#/$defs/shared' },
        },
      },
      {
        type: 'string',
        oneOf: [
          { type: 'string', controls: { active: false } },
          { type: 'string' },
        ],
      },
      {
        type: 'object',
        controls: { discriminator: 'kind' },
        oneOf: [
          {
            properties: {
              kind: { type: 'string', const: 'a' },
              value: { type: 'string' },
            },
          },
          {
            properties: {
              kind: { type: 'string', const: 'b' },
              other: { type: 'number' },
            },
          },
        ],
      },
    ];
    let expressions = 0;
    let appliesWhen = 0;
    const schemas = [...corpus.cases.map((sample) => sample.schema), ...extra];
    for (let sampleIndex = 0; sampleIndex < schemas.length; sampleIndex++) {
      const schema = schemas[sampleIndex];
      let analysis;
      try {
        analysis = blueprint(structuredClone(schema) as BlueprintSchema);
      } catch (cause) {
        if (sampleIndex >= corpus.cases.length) throw cause;
        expect((cause as Error).name).toBe('JSONSchemaError');
        continue;
      }
      const slots = [];
      for (const node of analysis.nodes)
        if (node.kind === 'array')
          for (let slot = 0; slot < 2; slot++) {
            const entry = getItemEntry(node, slot);
            if (entry) slots.push(entry);
          }
      const owners = new Map<object, string>();
      const records = collectOwnedInlineRecords(analysis, slots);
      expressions += analysis.expressions.length;
      for (let index = 0; index < records.length; index++) {
        const { record, shared, arrays } = records[index];
        expect(Object.isFrozen(record), `record ${index}`).toBe(
          DEVELOPMENT || shared,
        );
        for (const { field, value } of arrays) {
          expect(
            owners.has(value),
            `duplicate ${index}.${field}: ${owners.get(value)}`,
          ).toBe(false);
          owners.set(value, `${index}.${field}`);
          expect(Object.isFrozen(value), `${index}.${field}`).toBe(
            DEVELOPMENT || shared,
          );
          if (field === 'appliesWhen') appliesWhen++;
        }
      }
    }
    expect(expressions).toBeGreaterThan(0);
    expect(appliesWhen).toBeGreaterThan(0);
  });

  it('freezes generated public containers in single-static, fold and runtime producers', () => {
    const watch = ['../a'];
    const defaultValue = { untouched: true };
    const node = blueprint({
      type: 'object',
      required: ['a'],
      controls: { watch, default: defaultValue },
      properties: { a: { type: 'string' } },
      allOf: [{ properties: { b: { type: 'number' } } }],
    }).root;
    const single = mergeSchemaContributions(node, [node.declarations[0]], {
      mode: 'static',
    });
    for (const result of [single, mergeEffectiveSchema(node, [])]) {
      expect(Object.isFrozen(result)).toBe(DEVELOPMENT);
      expect(Object.isFrozen(result.schema)).toBe(true);
      const schema = result.schema as Record<string, unknown>;
      for (const key of ['required', 'allOf', 'controls'])
        if (schema[key]) expect(Object.isFrozen(schema[key])).toBe(true);
    }
    expect(Object.isFrozen(watch)).toBe(false);
    expect(Object.isFrozen(defaultValue)).toBe(false);
  });

  it('freezes union and narrowed types, patterns, exclusive clauses and enum intersections', () => {
    const union = blueprint({ type: ['string', 'number'] }).root;
    expect(Object.isFrozen(union.schemaType)).toBe(true);
    const objects = [{ value: 1 }, { value: 2 }];
    const enumNode = createEffectiveSchemaNode([
      { enum: objects },
      { enum: [objects[0]] },
    ]);
    const intersection = mergeEffectiveSchema(enumNode, []).schema as Record<
      string,
      unknown
    >;
    expect(Object.isFrozen(intersection.enum)).toBe(true);
    expect(Object.isFrozen(objects)).toBe(false);
    expect(Object.isFrozen(objects[0])).toBe(false);
    const patterns = blueprint({
      type: 'string',
      pattern: 'a',
      allOf: [{ pattern: 'b' }],
    }).root;
    const patternSchema = mergeEffectiveSchema(patterns, []).schema as {
      allOf: object[];
    };
    expect(Object.isFrozen(patternSchema.allOf)).toBe(true);
    expect(
      Object.isFrozen(patternSchema.allOf[patternSchema.allOf.length - 1]),
    ).toBe(true);
    const exclusive = createEffectiveSchemaNode(
      [{ minimum: 1, exclusiveMinimum: true }],
      { kind: 'number', schemaType: 'number' },
    );
    const exclusiveSchema = mergeEffectiveSchema(exclusive, []).schema as {
      allOf: object[];
    };
    expect(Object.isFrozen(exclusiveSchema.allOf)).toBe(true);
    expect(Object.isFrozen(exclusiveSchema.allOf[0])).toBe(true);
    const gate = createBlueprintGate({
      kind: 'active',
      schemaPath: '#/controls/active',
      hostPath: '',
      condition: true,
    });
    const narrowed = createEffectiveSchemaNode(
      [{ type: ['string', 'number'] }, { type: 'string' }],
      { kind: 'union', schemaType: union.schemaType },
      [{}, { gates: [gate] }],
    );
    expect(
      Object.isFrozen(
        (mergeEffectiveSchema(narrowed, [1]).schema as Record<string, unknown>)
          .type,
      ),
    ).toBe(true);
    const conflict = createEffectiveSchemaNode(
      [{ const: 1 }, { const: 2 }],
      {},
      [{}, { gates: [gate] }],
    );
    expect(
      Object.isFrozen(
        (mergeEffectiveSchema(conflict, [1]).schema as Record<string, unknown>)
          .enum,
      ),
    ).toBe(true);
  });

  it('freezes hint-created nested plain objects while preserving borrowed React/function/style values', () => {
    const element = createElement('span', null, 'label');
    const callback = () => 'opaque';
    const left = {
      style: { color: 'red', deep: { left: 1 } },
      element,
      callback,
    };
    const right = { style: { padding: 2, deep: { right: 2 } } };
    const authoredStyle = { border: 'none' };
    const schema = {
      type: 'string',
      options: { virtual: {} },
      presentation: { FormTypeInputProps: left, borrowed: authoredStyle },
      allOf: [{ presentation: { FormTypeInputProps: right } }],
    };
    const result = mergeEffectiveSchema(blueprint(schema).root, []);
    const publicSchema = result.schema as Record<string, any>;
    expect(Object.isFrozen(publicSchema.options)).toBe(true);
    expect(Object.isFrozen(publicSchema.presentation)).toBe(true);
    const props = publicSchema.presentation.FormTypeInputProps;
    for (const value of [props, props.style, props.style.deep])
      expect(Object.isFrozen(value)).toBe(true);
    expect(props.element).toBe(element);
    expect(props.callback).toBe(callback);
    for (const value of [
      schema,
      left,
      right,
      left.style,
      right.style,
      authoredStyle,
      callback,
    ])
      expect(Object.isFrozen(value)).toBe(false);
    expect(Object.isFrozen(element)).toBe(DEVELOPMENT);
    if (DEVELOPMENT)
      expect(
        Object.isFrozen((element as unknown as { _store: object })._store),
      ).toBe(false);
  });

  it('keeps gate-owned appliesWhen separate and shared metadata protected in both modes', () => {
    const parent = createBlueprintGate({
      kind: 'active',
      schemaPath: '#',
      hostPath: '',
      condition: '../enabled',
    });
    const appliesWhen = [parent];
    const gate = createBlueprintGate({
      kind: 'active',
      schemaPath: '#/children',
      hostPath: '',
      condition: false,
      appliesWhen,
    });
    expect(gate.appliesWhen).not.toBe(appliesWhen);
    expect(gate.appliesWhen?.[0]).toBe(parent);
    for (const value of [
      parent,
      gate,
      parent.evaluationReads,
      gate.evaluationReads,
      gate.appliesWhen,
    ])
      expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(appliesWhen)).toBe(false);
    const first = blueprint({ type: 'string' });
    const second = blueprint({ type: 'number' });
    expect(getFeatureNodeIndex(first)).toBe(getFeatureNodeIndex(second));
    expect(Object.isFrozen(getFeatureNodeIndex(first))).toBe(true);
    for (const key of ['expressions', 'dependencies'] as const) {
      expect(first[key]).not.toBe(second[key]);
      expect(Object.isFrozen(first[key])).toBe(DEVELOPMENT);
    }
    expect(Object.getPrototypeOf(first.dependencies)).toBe(null);
  });

  it('owns false envelopes per node and preserves same-node memo identity', () => {
    const firstNode = createEffectiveSchemaNode([false]);
    const first = mergeEffectiveSchema(firstNode, []);
    expect(mergeEffectiveSchema(firstNode, [])).toBe(first);
    expect(
      mergeEffectiveSchema(createEffectiveSchemaNode([false]), []),
    ).not.toBe(first);
    expect(first).toEqual({ schema: false, typeConflict: false });
    expect(Object.isFrozen(first)).toBe(DEVELOPMENT);
  });

  it('protects diagnostics only in development and creates owned slots after mounting', () => {
    const diagnostics: { details: Readonly<Record<string, unknown>> }[] = [];
    blueprint(
      {
        type: 'string',
        properties: { child: { type: 'string', options: { trim: true } } },
      },
      { collect: (value) => diagnostics.push(value) },
    );
    expect(diagnostics.length).toBeGreaterThan(0);
    for (const diagnostic of diagnostics) {
      expect(Object.isFrozen(diagnostic)).toBe(DEVELOPMENT);
      for (const key of ['keys', 'paths'])
        if (diagnostic.details[key])
          expect(Object.isFrozen(diagnostic.details[key])).toBe(DEVELOPMENT);
    }
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'array',
        items: { type: 'string', controls: { active: true } },
      },
      validationMode: 0,
    });
    const template = (
      root as unknown as {
        runtime: { blueprint: { root: Parameters<typeof getItemEntry>[0] } };
      }
    ).runtime.blueprint.root;
    const original = template.item!.declarations[0];
    const frozen = new Set<object>();
    for (let index = 0; index < 2; index++) {
      const entry = getItemEntry(template, index)!;
      const binding = entry.declarations[0];
      for (const value of [
        entry,
        entry.declarations,
        binding,
        binding.order,
        binding.gates,
      ])
        expect(Object.isFrozen(value)).toBe(DEVELOPMENT);
      expect(binding.order).not.toBe(original.order);
      expect(binding.gates).not.toBe(original.gates);
      expect(binding.gates[0]).toBe(original.gates[0]);
      expect(frozen.has(binding.order)).toBe(false);
      frozen.add(binding.order);
      expect(getItemEntry(template, index)).toBe(entry);
    }
  });

  it('borrows authored defaults and opaque descendants across two mounted forms', () => {
    const defaults = { nested: { count: 1 } };
    const callback = () => defaults;
    const instance = new Date(0);
    const style = { color: 'red' };
    const child = {
      type: 'number' as const,
      default: 1,
      controls: { default: 1 },
    };
    const properties = {
      nested: { type: 'object' as const, properties: { count: child } },
    };
    const schema = {
      type: 'object' as const,
      properties,
      default: defaults,
      controls: { default: defaults },
      presentation: { style, callback, instance },
      extension: { opaque: true },
    };
    const first = nodeFromJSONSchema({
      jsonSchema: schema as JSONSchema,
      validationMode: 0,
    });
    const second = nodeFromJSONSchema({
      jsonSchema: schema as JSONSchema,
      validationMode: 0,
    });
    first.find('/nested/count')!.setValue(2);
    expect(second.value).toEqual(defaults);
    expect(defaults).toEqual({ nested: { count: 1 } });
    const publicSchema = first.jsonSchema as Record<string, unknown>;
    expect(publicSchema.default).toBe(defaults);
    for (const value of [
      schema,
      properties,
      properties.nested,
      child,
      defaults,
      defaults.nested,
      schema.controls,
      schema.presentation,
      style,
      callback,
      instance,
      schema.extension,
    ])
      expect(Object.isFrozen(value)).toBe(false);
  });
});
