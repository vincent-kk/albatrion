import { describe, expect, it } from 'vitest';

import type {
  BlueprintGate,
  BlueprintSchema,
  EffectiveSchemaMemo,
} from '../type';
import { mergeEffectiveSchema } from '../utils/effectiveSchema/mergeEffectiveSchema';
import { createEffectiveSchemaNode } from './fixtures/createEffectiveSchemaNode';

/** A stored condition descriptor; these tests select IDs without evaluating it. */
const gate: BlueprintGate = {
  kind: 'active',
  condition: './enabled',
  hostPath: '',
  schemaPath: '#/oneOf/0/controls/active',
};

// filid:contract effective-schema
describe('mergeEffectiveSchema', () => {
  it('selects gates and sorts contributions, ignoring shared declaration-only branches', () => {
    const node = createEffectiveSchemaNode(
      [
        { title: 'later' },
        { title: 'earlier' },
        { title: 'gated' },
        { title: 'branch' },
      ],
      {},
      [
        { order: [2] },
        { order: [1] },
        { gates: [gate], order: [3] },
        { context: 'declaration', order: [4] },
      ],
    );
    expect(mergeEffectiveSchema(node, [])).toMatchObject({ title: 'later' });
    expect(mergeEffectiveSchema(node, [2])).toMatchObject({ title: 'gated' });
    const sole = createEffectiveSchemaNode(
      [
        { title: 'branch' },
        { description: 'overlay' },
        { title: 'branch conditional' },
      ],
      {},
      [
        { context: 'declaration' },
        { role: 'overlay' },
        { role: 'overlay', context: 'declaration', fragmentId: 0 },
      ],
    );
    expect(mergeEffectiveSchema(sole, [])).toMatchObject({
      title: 'branch',
      description: 'overlay',
    });
    const host = createEffectiveSchemaNode(
      [{ title: 'host' }, { type: 'string' }, { type: 'number' }],
      { kind: 'union', schemaType: ['string', 'number'] },
      [
        {},
        { role: 'overlay', context: 'declaration' },
        { role: 'overlay', context: 'declaration' },
      ],
    );
    expect(mergeEffectiveSchema(host, [], { mode: 'static' })).toMatchObject({
      title: 'host',
      type: ['string', 'number'],
    });
    const validationOnly = createEffectiveSchemaNode(
      [{ title: 'host' }, { title: 'validator only', type: 'number' }],
      {},
      [{}, { role: 'overlay', validationOnly: true }],
    );
    expect(
      mergeEffectiveSchema(validationOnly, [], { mode: 'static' }),
    ).toMatchObject({ title: 'host', type: 'string' });
  });

  it('intersects numeric, length, item and property bounds with multipleOf', () => {
    const node = createEffectiveSchemaNode([
      {
        minimum: 1,
        maximum: 20,
        minLength: 1,
        maxLength: 20,
        minItems: 1,
        maxItems: 20,
        minProperties: 1,
        maxProperties: 20,
        multipleOf: 2,
      },
      {
        minimum: 4,
        maximum: 12,
        minLength: 3,
        maxLength: 10,
        minItems: 2,
        maxItems: 8,
        minProperties: 3,
        maxProperties: 9,
        multipleOf: 3,
      },
    ]);
    expect(mergeEffectiveSchema(node, [])).toMatchObject({
      minimum: 4,
      maximum: 12,
      minLength: 3,
      maxLength: 10,
      minItems: 2,
      maxItems: 8,
      minProperties: 3,
      maxProperties: 9,
      multipleOf: 6,
    });
  });

  it('unions required, overwrites annotations, and combines standard readOnly locally', () => {
    const node = createEffectiveSchemaNode([
      { required: ['a'], title: 'first', readOnly: true },
      { required: ['a', 'b'], title: 'last', default: 3, readOnly: false },
    ]);
    expect(mergeEffectiveSchema(node, [])).toMatchObject({
      required: ['a', 'b'],
      title: 'last',
      default: 3,
      readOnly: true,
    });
  });

  it('intersects enum and const by deep equality without conflating keywords', () => {
    const value = { x: 1 };
    const node = createEffectiveSchemaNode([
      { enum: [value, { x: 2 }], const: value },
      { enum: [{ x: 1 }], const: { x: 1 } },
    ]);
    const result = mergeEffectiveSchema(node, []) as Record<string, unknown>;
    expect(result.enum).toEqual([value]);
    expect(result.const).toBe(value);
    expect(
      mergeEffectiveSchema(
        createEffectiveSchemaNode([{ const: 1 }, { enum: [2] }]),
        [],
        { mode: 'static' },
      ),
    ).toMatchObject({ const: 1, enum: [2] });
  });

  it('reports static enum, const and range failures at the contributing schema path', () => {
    const cases: readonly [BlueprintSchema, BlueprintSchema, string][] = [
      [{ enum: [1] }, { enum: [2] }, 'EMPTY_ENUM_INTERSECTION'],
      [{ const: 1 }, { const: 2 }, 'CONFLICTING_CONST_VALUES'],
      [{ minimum: 5 }, { maximum: 2 }, 'INVALID_RANGE'],
    ];
    for (const [left, right, code] of cases) {
      const diagnostics: unknown[] = [];
      expect(() =>
        mergeEffectiveSchema(createEffectiveSchemaNode([left, right]), [], {
          mode: 'static',
          collect: (d) => diagnostics.push(d),
        }),
      ).toThrow(code);
      expect(diagnostics).toContainEqual(
        expect.objectContaining({ code, schemaPath: '#/allOf/1' }),
      );
    }
  });

  it('keeps runtime impossibility as enum empty or inverted ranges, with const removed', () => {
    expect(
      mergeEffectiveSchema(
        createEffectiveSchemaNode([{ enum: [1] }, { enum: [2] }]),
        [],
      ),
    ).toMatchObject({ enum: [] });
    const result = mergeEffectiveSchema(
      createEffectiveSchemaNode([{ const: 1 }, { const: 2 }, { const: 3 }]),
      [],
    ) as Record<string, unknown>;
    expect(result.enum).toEqual([]);
    expect(result).not.toHaveProperty('const');
    expect(
      mergeEffectiveSchema(
        createEffectiveSchemaNode([{ minimum: 5 }, { maximum: 2 }]),
        [],
      ),
    ).toMatchObject({ minimum: 5, maximum: 2 });
  });

  it('preserves the first pattern and appends other distinct patterns as allOf', () => {
    const node = createEffectiveSchemaNode([
      { pattern: '^a', allOf: [{ format: 'opaque' }] },
      { pattern: 'z$' },
      { pattern: '^a' },
    ]);
    expect(mergeEffectiveSchema(node, [])).toMatchObject({
      pattern: '^a',
      allOf: [{ format: 'opaque' }, { pattern: 'z$' }],
    });
  });

  it('merges groups without mutation, moving unshared references and replacing arrays', () => {
    const shared = { deep: true },
      list = [2];
    const options = { nested: { first: 1 }, shared, list: [1] };
    const node = createEffectiveSchemaNode([
      { options },
      { options: { nested: { second: 2 }, shared: undefined, list } },
    ]);
    const result = mergeEffectiveSchema(node, []) as Record<string, any>;
    expect(result.options).toEqual({
      nested: { first: 1, second: 2 },
      shared,
      list,
    });
    expect(result.options.shared).toBe(shared);
    expect(result.options.list).toBe(list);
    expect(options).toEqual({ nested: { first: 1 }, shared, list: [1] });
    expect(
      (
        mergeEffectiveSchema(
          createEffectiveSchemaNode([{ options }]),
          [],
        ) as Record<string, unknown>
      ).options,
    ).toBe(options);
  });

  it('leaves behavioral, state and virtual declarations intact outside effective hints', () => {
    const derived = () => 1;
    const controls = {
      derived,
      active: './enabled',
      unsetOnInactive: true,
      watch: ['./a'],
      default: 1,
    };
    const virtual = [{ name: 'group', fields: ['a'] }];
    const node = createEffectiveSchemaNode([
      { controls, options: { virtual, omitEmpty: true } },
      { controls: { watch: ['./b'], default: 2 } },
    ]);
    expect(mergeEffectiveSchema(node, [])).toMatchObject({
      controls: { watch: ['./b'], default: 2 },
      options: { omitEmpty: true },
    });
    expect(
      (mergeEffectiveSchema(node, []) as Record<string, any>).controls,
    ).not.toHaveProperty('derived');
    expect(node.declarations[0].schema).toEqual({
      controls,
      options: { virtual, omitEmpty: true },
    });
    expect(
      (mergeEffectiveSchema(node, []) as Record<string, any>).options,
    ).not.toHaveProperty('virtual');
    const fragment = createEffectiveSchemaNode(
      [
        { controls: { watch: ['./node'], default: 1 } },
        { controls: { watch: ['./fragment'], default: 2 } },
      ],
      {},
      [{}, { role: 'overlay', scope: 'fragment' }],
    );
    expect(mergeEffectiveSchema(fragment, [])).toMatchObject({
      controls: { watch: ['./node'], default: 1 },
    });
  });

  it('narrows integer subsets and preserves scalar or shared static type identity', () => {
    const schemaType = Object.freeze(['string', 'number'] as const);
    const node = createEffectiveSchemaNode(
      [{ type: schemaType }, { type: 'integer' }],
      { kind: 'union', schemaType },
      [{}, { gates: [gate] }],
    );
    expect(
      (mergeEffectiveSchema(node, []) as Record<string, unknown>).type,
    ).toBe(schemaType);
    expect(mergeEffectiveSchema(node, [1])).toMatchObject({
      type: ['integer'],
    });
    const scalar = createEffectiveSchemaNode(
      [{ type: 'number' }, { type: 'number' }],
      { kind: 'number', schemaType: 'number' },
      [{}, { gates: [gate] }],
    );
    expect(mergeEffectiveSchema(scalar, [1])).toMatchObject({ type: 'number' });
    const nullable = createEffectiveSchemaNode(
      [{ type: ['number', 'null'] }, { type: 'number' }],
      { kind: 'number', schemaType: 'number', nullable: true },
    );
    expect(mergeEffectiveSchema(nullable, [])).toMatchObject({
      type: 'number',
      nullable: false,
    });
    const nullOnly = createEffectiveSchemaNode(
      [{ type: ['number', 'null'] }, { type: 'null' }],
      { kind: 'number', schemaType: 'number', nullable: true },
    );
    expect(mergeEffectiveSchema(nullOnly, [])).toMatchObject({
      type: 'null',
      nullable: true,
    });
  });

  it('represents runtime gated type conflict without throwing or creating type empty', () => {
    const node = createEffectiveSchemaNode(
      [{ type: 'string' }, { type: 'number' }],
      {},
      [{}, { gates: [gate] }],
    );
    expect(mergeEffectiveSchema(node, [1])).toMatchObject({
      type: 'string',
      enum: [],
    });
    expect(node.declarations[1].schema).toEqual({ type: 'number' });
    expect(() => mergeEffectiveSchema(node, [1], { mode: 'static' })).toThrow(
      'ALL_OF_TYPE_REDEFINITION',
    );
  });

  it('memoizes normalized active sets and separates static from runtime checks', () => {
    const node = createEffectiveSchemaNode([{ const: 1 }, { const: 2 }], {}, [
      {},
      { gates: [gate] },
    ]);
    const first = mergeEffectiveSchema(node, [1]);
    expect(mergeEffectiveSchema(node, [1, 1, 0])).toBe(first);
    expect(mergeEffectiveSchema(node, [])).not.toBe(first);
    expect(() => mergeEffectiveSchema(node, [1], { mode: 'static' })).toThrow(
      'CONFLICTING_CONST_VALUES',
    );
  });

  it('separates memo contexts by atomic predicate and accepts a caller-owned memo', () => {
    const earlier = { opaque: true, a: 1 },
      later = { opaque: true, b: 2 };
    const node = createEffectiveSchemaNode([
      { presentation: { input: earlier } },
      { presentation: { input: later } },
    ]);
    const isAtomic = (value: unknown) =>
      typeof value === 'object' && value !== null && 'opaque' in value;
    const memo: EffectiveSchemaMemo = new WeakMap();
    const atomic = mergeEffectiveSchema(node, [], { isAtomic }, memo) as Record<
      string,
      any
    >;
    expect(atomic.presentation.input).toBe(later);
    expect(mergeEffectiveSchema(node, [], { isAtomic }, memo)).toBe(atomic);
    expect(
      (mergeEffectiveSchema(node, [], {}, memo) as Record<string, any>)
        .presentation.input,
    ).toEqual({ opaque: true, a: 1, b: 2 });
  });

  it('keeps boolean false schemas and ignores boolean true overlays', () => {
    expect(mergeEffectiveSchema(createEffectiveSchemaNode([false]), [])).toBe(
      false,
    );
    expect(
      mergeEffectiveSchema(
        createEffectiveSchemaNode([true, { title: 'hint' }]),
        [],
      ),
    ).toMatchObject({ title: 'hint' });
  });

  it('preserves draft-04 boolean exclusivity with its authored bound in allOf', () => {
    const relaxed = mergeEffectiveSchema(
      createEffectiveSchemaNode([
        { minimum: 1, exclusiveMinimum: true },
        { minimum: 2, exclusiveMinimum: false },
      ]),
      [],
    ) as Record<string, unknown>;
    expect(relaxed).toMatchObject({
      minimum: 2,
      allOf: [
        { minimum: 1, exclusiveMinimum: true },
        { minimum: 2, exclusiveMinimum: false },
      ],
    });
    expect(relaxed).not.toHaveProperty('exclusiveMinimum');
    const strict = mergeEffectiveSchema(
      createEffectiveSchemaNode([
        { minimum: 2, exclusiveMinimum: true },
        { minimum: 2, exclusiveMinimum: false },
      ]),
      [],
    ) as Record<string, unknown>;
    expect(strict).toMatchObject({
      minimum: 2,
      allOf: [
        { minimum: 2, exclusiveMinimum: true },
        { minimum: 2, exclusiveMinimum: false },
      ],
    });
    expect(strict).not.toHaveProperty('exclusiveMinimum');
  });
});
