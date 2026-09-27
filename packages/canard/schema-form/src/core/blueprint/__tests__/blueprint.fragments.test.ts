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
    expect(mergeEffectiveSchema(root, [])).not.toHaveProperty(
      'controls.default',
    );
    expect(root.childEntries[0].node.declarations[0].scope).toBe('node');
  });
});
