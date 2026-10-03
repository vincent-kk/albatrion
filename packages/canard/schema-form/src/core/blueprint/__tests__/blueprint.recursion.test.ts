import { describe, expect, it } from 'vitest';

import { blueprint } from '../index';
import { BlueprintErrorCode } from '../utils/diagnostics/constant';

// filid:contract recursion
describe('blueprint finite reference and shape graph', () => {
  it('rejects required eager object shape, including nullable recursion', () => {
    for (const type of ['object', ['object', 'null']])
      expect(() =>
        blueprint({ type, properties: { next: { $ref: '#' } } }),
      ).toThrow(
        expect.objectContaining({
          specific: BlueprintErrorCode.RecursiveShapeUnbounded,
        }),
      );
  });
  it('rejects an unbounded A-to-B-to-A object property cycle', () => {
    const schema = {
      $defs: {
        A: {
          type: 'object',
          properties: { b: { $ref: '#/$defs/B' } },
        },
        B: {
          type: 'object',
          properties: { a: { $ref: '#/$defs/A' } },
        },
      },
      $ref: '#/$defs/A',
    };
    expect(() => blueprint(schema)).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.RecursiveShapeUnbounded,
      }),
    );
  });
  it('shares an array item back-reference without expanding shape', () => {
    const result = blueprint({
      type: 'object',
      properties: { children: { type: 'array', items: { $ref: '#' } } },
    });
    expect(result.nodes).toHaveLength(2);
    expect(result.root.childEntries[0].node.item).toBe(result.root);
  });
  it('cuts conditional property recursion with a finite graph', () => {
    const result = blueprint({
      type: 'object',
      if: { required: ['flag'] },
      then: { properties: { next: { $ref: '#' } } },
    });
    expect(result.nodes.length).toBeLessThan(4);
    expect(result.root.childEntries[0].declarations[0].gates).toHaveLength(1);
  });
  it('cuts terminal object recursion before making children', () => {
    const result = blueprint({
      type: 'object',
      options: { terminal: true },
      properties: { next: { $ref: '#' } },
    });
    expect(result.nodes).toHaveLength(1);
    expect(result.root.childEntries).toHaveLength(0);
  });
  it('cuts fragment reference cycles without treating them as shape', () => {
    const result = blueprint({
      type: 'object',
      allOf: [{ $ref: '#' }],
      properties: { name: { type: 'string' } },
    });
    expect(result.nodes).toHaveLength(2);
    expect(result.fragments.length).toBeLessThan(5);
  });

  it('preserves conditional children rule application separately from its active condition', () => {
    const result = blueprint({
      type: 'object',
      properties: { child: { $ref: '#' } },
      controls: {
        active: './rootOn',
        children: [{ targets: ['child'], controls: { active: './childOn' } }],
      },
    });
    const gate = result.root.childEntries[0].declarations[0].gates.find(
      (item) =>
        item.schemaPath.endsWith('/controls/children/0/controls/active'),
    )!;
    expect(gate.condition).toBe('./childOn');
    expect(gate.appliesWhen?.[0].condition).toBe('./rootOn');
    expect(result.nodes.length).toBeLessThan(4);
  });

  it('retains referenced overlays and child shape for a gated-only property', () => {
    const result = blueprint({
      type: 'object',
      $defs: {
        child: { type: 'object', properties: { value: { type: 'number' } } },
      },
      if: {},
      then: { properties: { child: { $ref: '#/$defs/child' } } },
    });
    const child = result.root.childEntries[0].node;
    expect(
      child.declarations.some(
        (declaration) => declaration.schemaPath === '#/$defs/child',
      ),
    ).toBe(true);
    expect(child.childEntries.map((edge) => edge.name)).toEqual(['value']);
  });

  it('reports malformed reference URI decoding with the authored path and cause', () => {
    expect(() =>
      blueprint({ type: 'object', properties: { value: { $ref: '#/%' } } }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.UnknownJsonSchema,
        details: expect.objectContaining({
          schemaPath: '#/properties/value',
          reference: '#/%',
          cause: expect.any(URIError),
        }),
      }),
    );
  });

  it('reports reference pointer failures without leaking the underlying exception', () => {
    const schema = {
      type: 'object',
      properties: { value: { $ref: '#invalid' } },
    };
    expect(() => blueprint(schema)).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.UnknownJsonSchema,
        details: expect.objectContaining({
          schemaPath: '#/properties/value',
          reference: '#invalid',
          cause: expect.objectContaining({ specific: 'INVALID_POINTER_TYPE' }),
        }),
      }),
    );
  });
});
