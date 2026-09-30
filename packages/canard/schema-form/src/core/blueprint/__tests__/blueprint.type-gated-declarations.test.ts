import { isArray } from '@winglet/common-utils/filter';
import { describe, expect, it } from 'vitest';

import { blueprint, mergeEffectiveSchema } from '../index';
import { BlueprintErrorCode } from '../utils/diagnostics/constant';

// filid:contract type-gated-declarations
describe('blueprint gated and declaration-only types', () => {
  it.each([
    ['E25', ['string', 'number'], 'number', 'union', ['string', 'number']],
    ['E26', 'number', ['number', 'string'], 'number', 'number'],
    ['E41', 'number', 'integer', 'number', 'number'],
  ] as const)(
    '%s keeps the static type while retaining the gated restriction',
    (_id, type, gatedType, kind, schemaType) => {
      const node = blueprint({
        type: 'object',
        properties: { a: { type } },
        if: { required: ['flag'] },
        then: { properties: { a: { type: gatedType } } },
      }).root.childEntries[0].node;
      expect(node).toMatchObject({
        kind,
        schemaType,
        nullable: false,
        strategy: 'terminal',
      });
      expect(
        node.declarations.filter((declaration) => declaration.gates.length),
      ).toHaveLength(1);
      const effective = mergeEffectiveSchema(
        node,
        node.declarations
          .filter((declaration) => declaration.gates.length)
          .map((declaration) => declaration.id),
      ).schema;
      expect(typeof effective === 'object' && effective.type).toEqual(
        _id === 'E26' ? 'number' : [_id === 'E41' ? 'integer' : 'number'],
      );
      if (typeof effective === 'object' && isArray(effective.type))
        expect(Object.isFrozen(effective.type)).toBe(true);
      if (_id === 'E26')
        expect(typeof effective === 'object' && effective.type).toBe(
          node.schemaType,
        );
    },
  );

  it('E27 preserves distinct gated kinds when no static declaration exists', () => {
    const root = blueprint({
      type: 'object',
      if: { required: ['flag'] },
      then: { properties: { a: { type: ['string', 'number'] } } },
      else: { properties: { a: { type: 'number' } } },
    }).root;
    expect(root.childEntries.map((edge) => edge.node.kind)).toEqual([
      'union',
      'number',
    ]);
    expect(
      root.childEntries.map(
        (edge) => edge.node.declarations[0].gates[0].negated,
      ),
    ).toEqual([false, true]);
  });

  it('E40 retains incompatible gated restrictions without a static construction failure', () => {
    const node = blueprint({
      type: 'object',
      properties: { a: { type: ['string', 'number', 'boolean'] } },
      allOf: [
        {
          if: { required: ['x'] },
          then: { properties: { a: { type: 'string' } } },
        },
        {
          if: { required: ['y'] },
          then: { properties: { a: { type: 'boolean' } } },
        },
      ],
    }).root.childEntries[0].node;
    expect(node.schemaType).toEqual(['string', 'number', 'boolean']);
    expect(
      node.declarations.filter((declaration) => declaration.gates.length),
    ).toHaveLength(2);
    const effective = mergeEffectiveSchema(
      node,
      node.declarations
        .filter((declaration) => declaration.gates.length)
        .map((declaration) => declaration.id),
    );
    expect(effective.typeConflict).toBe(true);
    expect(effective.schema).not.toHaveProperty('enum');
  });

  it('E40 keeps static nullable when the gated type intersection conflicts', () => {
    const node = blueprint({
      type: 'object',
      properties: { a: { type: ['string', 'number', 'boolean', 'null'] } },
      allOf: [
        {
          if: { required: ['x'] },
          then: { properties: { a: { type: 'string' } } },
        },
        {
          if: { required: ['y'] },
          then: { properties: { a: { type: 'boolean' } } },
        },
      ],
    }).root.childEntries[0].node;
    const effective = mergeEffectiveSchema(
      node,
      node.declarations
        .filter((declaration) => declaration.gates.length)
        .map((declaration) => declaration.id),
    );
    expect(effective.typeConflict).toBe(true);
    expect(effective.schema).toMatchObject({ nullable: true });
    expect(effective.schema).not.toHaveProperty('enum');
  });
  it('E42 keeps an ungated oneOf declaration from narrowing the shared node', () => {
    const node = blueprint({
      type: 'object',
      properties: { a: { type: ['string', 'number'] } },
      oneOf: [{ properties: { a: { type: 'string' } } }],
    }).root.childEntries[0].node;
    expect(node.schemaType).toEqual(['string', 'number']);
    expect(node.declarations[1].context).toBe('declaration');
    expect(mergeEffectiveSchema(node, []).schema).toMatchObject({
      type: ['string', 'number'],
    });
  });

  it('rejects unrelated ungated branch folds without a static owner', () => {
    expect(() =>
      blueprint({
        type: 'object',
        oneOf: [
          { properties: { a: { type: 'string' } } },
          { properties: { a: { type: 'number' } } },
        ],
      }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.SharedNodeKindConflict,
      }),
    );
  });

  it('joins same-fold branch-only integer and number declarations', () => {
    const node = blueprint({
      type: 'object',
      oneOf: [
        { properties: { a: { type: 'integer' } } },
        { properties: { a: { type: ['number', 'null'] } } },
      ],
    }).root.childEntries[0].node;
    expect(node).toMatchObject({
      kind: 'number',
      schemaType: 'number',
      nullable: true,
    });
  });
  it('E40 exposes the retained conflict as a result signal, never as enum empty', () => {
    const node = blueprint({
      type: 'object',
      properties: { a: { type: ['string', 'number', 'boolean'] } },
      allOf: [
        {
          if: { required: ['x'] },
          then: { properties: { a: { type: 'string' } } },
        },
        {
          if: { required: ['y'] },
          then: { properties: { a: { type: 'boolean' } } },
        },
      ],
    }).root.childEntries[0].node;
    const gated = node.declarations
      .filter((declaration) => declaration.gates.length)
      .map((declaration) => declaration.id);
    const effective = mergeEffectiveSchema(node, gated);
    expect(effective.typeConflict).toBe(true);
    expect(effective.schema).not.toHaveProperty('enum');
    expect(effective.schema).toMatchObject({ type: node.schemaType });
    expect(mergeEffectiveSchema(node, gated)).toBe(effective);
    expect(mergeEffectiveSchema(node, [gated[0]]).typeConflict).toBe(false);
    expect(node).toMatchObject({ kind: 'union', strategy: 'terminal' });
  });

  it.each([
    ['E25', ['string', 'number'], 'number'],
    ['E26', 'number', ['number', 'string']],
    ['E41', 'number', 'integer'],
  ] as const)(
    '%s keeps the node schemaType reference across the gate',
    (_id, type, gatedType) => {
      const node = blueprint({
        type: 'object',
        properties: { a: { type } },
        if: { required: ['flag'] },
        then: { properties: { a: { type: gatedType } } },
      }).root.childEntries[0].node;
      const before = node.schemaType;
      const gated = node.declarations
        .filter((declaration) => declaration.gates.length)
        .map((declaration) => declaration.id);
      mergeEffectiveSchema(node, gated);
      expect(node.schemaType).toBe(before);
      const schema = mergeEffectiveSchema(node, []).schema;
      expect(typeof schema === 'object' && schema.type).toBe(before);
    },
  );

  it('E42 keeps the shared schemaType reference in the effective schema', () => {
    const node = blueprint({
      type: 'object',
      properties: { a: { type: ['string', 'number'] } },
      oneOf: [{ properties: { a: { type: 'string' } } }],
    }).root.childEntries[0].node;
    const schema = mergeEffectiveSchema(node, []).schema;
    expect(typeof schema === 'object' && schema.type).toBe(node.schemaType);
    expect(node).toMatchObject({ kind: 'union', strategy: 'terminal' });
  });

  it('E27 keeps terminal strategy on both distinct gated kinds', () => {
    const root = blueprint({
      type: 'object',
      if: { required: ['flag'] },
      then: { properties: { a: { type: ['string', 'number'] } } },
      else: { properties: { a: { type: 'number' } } },
    }).root;
    expect(
      root.childEntries.map((edge) => [edge.node.kind, edge.node.strategy]),
    ).toEqual([
      ['union', 'terminal'],
      ['number', 'terminal'],
    ]);
  });
});
