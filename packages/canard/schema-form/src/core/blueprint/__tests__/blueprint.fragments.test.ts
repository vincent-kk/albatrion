import { describe, expect, it, vi } from 'vitest';

import { blueprint, mergeEffectiveSchema } from '../index';
import { BlueprintErrorCode } from '../utils/diagnostics/constant';

// filid:contract fragment-declarations
describe('blueprint fragment ownership and strategies', () => {
  it('orders contributors by keyword rank despite authored key order', () => {
    const node = blueprint({
      type: 'object',
      anyOf: [{ properties: { a: { type: 'string' } } }],
      oneOf: [{ properties: { a: { type: 'string' } } }],
      if: {},
      then: { properties: { a: { type: 'string' } } },
      allOf: [{ properties: { a: { type: 'string' } } }],
      properties: { a: { type: 'string' } },
    }).root.childEntries[0].node;
    expect(
      node.declarations.map((declaration) => declaration.schemaPath),
    ).toEqual([
      '#/properties/a',
      '#/allOf/0/properties/a',
      '#/then/properties/a',
      '#/oneOf/0/properties/a',
      '#/anyOf/0/properties/a',
    ]);
  });
  it('keeps sibling reference overlays in different templates', () => {
    const root = blueprint({
      type: 'object',
      $defs: { scalar: { type: 'number' } },
      properties: {
        a: { $ref: '#/$defs/scalar', minimum: 2 },
        b: { $ref: '#/$defs/scalar', maximum: 8 },
      },
    }).root;
    expect(root.childEntries[0].node).not.toBe(root.childEntries[1].node);
    expect(
      root.childEntries[0].node.declarations.some(
        (declaration) =>
          typeof declaration.schema === 'object' &&
          declaration.schema.maximum === 8,
      ),
    ).toBe(false);
    expect(
      root.childEntries[1].node.declarations.some(
        (declaration) =>
          typeof declaration.schema === 'object' &&
          declaration.schema.minimum === 2,
      ),
    ).toBe(false);
  });
  it('shares pure references while retaining edge names and hosts', () => {
    const root = blueprint({
      type: 'object',
      $defs: { scalar: { type: 'number' } },
      properties: {
        a: { $ref: '#/$defs/scalar' },
        b: { $ref: '#/$defs/scalar' },
      },
    }).root;
    expect(root.childEntries[0].node).toBe(root.childEntries[1].node);
    expect(
      root.childEntries.map((edge) => [
        edge.name,
        edge.hostPath,
        edge.declarations[0].path,
      ]),
    ).toEqual([
      ['a', '', '/a'],
      ['b', '', '/b'],
    ]);
    expect(root.childEntries[1].declarations[0].schemaPath).toBe(
      '#/properties/b',
    );
  });
  it('retains inherited overlays in the referring host fragment', () => {
    const result = blueprint({
      type: 'object',
      $defs: { scalar: { type: 'number' } },
      properties: { a: { $ref: '#/$defs/scalar', minimum: 2 } },
    });
    const overlay = result.root.childEntries[0].node.declarations.find(
      (declaration) => declaration.inherited,
    )!;
    expect(result.fragments[overlay.fragmentId].inheritedOverlays).toContain(
      overlay.id,
    );
    expect(overlay.hostPath).toBe('');
  });
  it('does not consult renderer strategy for fixed primitive rows', () => {
    const isTerminal = vi.fn(() => false);
    expect(blueprint({ type: 'string' }, { isTerminal }).root.strategy).toBe(
      'terminal',
    );
    expect(isTerminal).not.toHaveBeenCalled();
  });
  it('lets an explicit false override the renderer decision', () => {
    expect(
      blueprint(
        { type: 'object', options: { terminal: false } },
        { isTerminal: () => true },
      ).root.strategy,
    ).toBe('branch');
  });
  it('rejects strategy changes across gated cases', () => {
    expect(() =>
      blueprint({
        type: 'object',
        properties: { a: { type: 'object' } },
        if: {},
        then: {
          properties: { a: { type: 'object', options: { terminal: true } } },
        },
      }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.TerminalStrategyMismatch,
      }),
    );
  });
  it('groups virtual fields as references without rewriting required', () => {
    const schema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
      required: ['pair'],
      options: { virtual: { pair: { fields: ['b', 'a'] } } },
    };
    const root = blueprint(schema).root;
    const pair = root.childEntries.find((edge) => edge.name === 'pair')!.node;
    expect(pair).toMatchObject({
      kind: 'virtual',
      schemaType: 'virtual',
      strategy: 'branch',
      fields: ['b', 'a'],
    });
    expect(pair.childEntries.map((edge) => edge.node)).toEqual([
      root.childEntries[1].node,
      root.childEntries[0].node,
    ]);
    expect(schema.required).toEqual(['pair']);
  });
  it('rejects reordered virtual fields even in exclusive gates', () => {
    expect(() =>
      blueprint({
        type: 'object',
        properties: { a: { type: 'string' }, b: { type: 'string' } },
        if: {},
        then: { options: { virtual: { pair: { fields: ['a', 'b'] } } } },
        else: { options: { virtual: { pair: { fields: ['b', 'a'] } } } },
      }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.VirtualFieldsMismatch,
      }),
    );
  });
  it('rejects a virtual terminal strategy and missing real fields', () => {
    expect(() =>
      blueprint({
        type: 'object',
        properties: { a: { type: 'string' } },
        options: {
          virtual: { pair: { fields: ['a'], options: { terminal: true } } },
        },
      }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.TerminalOptionUnsupported,
      }),
    );
    expect(() =>
      blueprint({
        type: 'object',
        options: { virtual: { pair: { fields: ['missing'] } } },
      }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.VirtualFieldsNotInProperties,
      }),
    );
  });

  it('preserves fragment controls as direct-child rules without merging them onto the host', () => {
    const root = blueprint({
      type: 'object',
      allOf: [
        {
          controls: { default: { fragment: true }, readOnly: true },
          properties: { a: { type: 'string' } },
        },
      ],
    }).root;
    expect(root.declarations[1].scope).toBe('fragment');
    expect(mergeEffectiveSchema(root, []).schema).not.toHaveProperty(
      'controls.default',
    );
    expect(root.childEntries[0].node.declarations[0].scope).toBe('node');
  });

  it('lets the later ungated strategy declaration win', () => {
    const root = blueprint({
      type: 'object',
      options: { terminal: false },
      allOf: [{ options: { terminal: true } }],
    }).root;
    expect(root.strategy).toBe('terminal');
  });

  it('allows a sole gated declaration to select an inline or explicit terminal strategy', () => {
    for (const schema of [
      { type: 'object', presentation: { FormTypeInput: 'inline' } },
      { type: 'object', options: { terminal: true } },
    ]) {
      const root = blueprint(
        { type: 'object', if: {}, then: { properties: { only: schema } } },
        {
          isTerminal: (schema) =>
            typeof schema === 'object' && schema.presentation
              ? true
              : undefined,
        },
      ).root;
      expect(root.childEntries[0].node.strategy).toBe('terminal');
    }
  });

  it('retains a static explicit strategy when a gated declaration adds an inline input', () => {
    const root = blueprint(
      {
        type: 'object',
        properties: { a: { type: 'object', options: { terminal: false } } },
        if: {},
        then: {
          properties: {
            a: { type: 'object', presentation: { FormTypeInput: 'inline' } },
          },
        },
      },
      {
        isTerminal: (schema) =>
          typeof schema === 'object' && schema.presentation ? true : undefined,
      },
    ).root;
    expect(root.childEntries[0].node.strategy).toBe('branch');
  });

  it('keeps an earlier renderer decision when a later predicate result is undefined', () => {
    const root = blueprint(
      {
        type: 'object',
        presentation: { FormTypeInput: 'inline' },
        allOf: [{ title: 'later' }],
      },
      {
        isTerminal: (schema) =>
          typeof schema === 'object' && schema.presentation ? true : undefined,
      },
    ).root;
    expect(root.strategy).toBe('terminal');
  });
  it('gathers names declared only in active, oneOf, anyOf, discriminator and then/else branches as host children', () => {
    const names = (schema: Record<string, unknown>) =>
      blueprint(schema).root.childEntries.map((edge) => edge.name);
    expect(
      names({
        type: 'object',
        properties: { base: { type: 'string' } },
        if: { properties: { probe: { const: 1 } } },
        then: { properties: { fromThen: { type: 'string' } } },
        else: { properties: { fromElse: { type: 'string' } } },
        oneOf: [
          {
            controls: { active: './base' },
            properties: { fromActive: { type: 'string' } },
          },
          { properties: { fromOneOf: { type: 'string' } } },
        ],
        anyOf: [{ properties: { fromAnyOf: { type: 'string' } } }],
      }),
    ).toEqual(
      expect.arrayContaining([
        'base',
        'fromThen',
        'fromElse',
        'fromActive',
        'fromOneOf',
        'fromAnyOf',
      ]),
    );
    expect(
      names({
        type: 'object',
        controls: { discriminator: 'kind' },
        oneOf: [
          {
            properties: {
              kind: { type: 'string', const: 'a' },
              onlyA: { type: 'string' },
            },
          },
        ],
      }),
    ).toEqual(expect.arrayContaining(['kind', 'onlyA']));
  });

  it('does not gather names written only inside an if schema', () => {
    const names = blueprint({
      type: 'object',
      properties: { base: { type: 'string' } },
      if: { properties: { probe: { const: 1 } } },
      then: { properties: { fromThen: { type: 'string' } } },
    }).root.childEntries.map((edge) => edge.name);
    expect(names).not.toContain('probe');
    expect(names).toContain('fromThen');
  });
});
