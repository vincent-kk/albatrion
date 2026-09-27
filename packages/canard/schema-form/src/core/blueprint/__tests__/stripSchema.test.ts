import { describe, expect, it } from 'vitest';

import { stripSchema } from '../utils/stripSchema/stripSchema';

// filid:contract validator-schema
describe('stripSchema', () => {
  it('strips draft-07 schema dependencies while preserving property dependency data', () => {
    const names = ['controls', 'options', 'presentation'];
    const schema = {
      dependencies: {
        a: names,
        b: { controls: {}, properties: { c: { options: {} } } },
        c: false,
      },
    };
    expect(stripSchema(schema)).toEqual({
      dependencies: { a: names, b: { properties: { c: {} } }, c: false },
    });
    expect(schema.dependencies.b.controls).toEqual({});
  });

  it('preserves boolean schemas and identity when no form groups exist', () => {
    expect(stripSchema(false)).toBe(false);
    expect(stripSchema(true)).toBe(true);
    const schema = { type: 'string', minLength: 1 };
    expect(stripSchema(schema)).toBe(schema);
  });

  it('removes the three reserved groups from nested schema positions', () => {
    const schema = {
      controls: {},
      options: {},
      presentation: {},
      properties: { a: { type: 'string', controls: {} } },
      items: { options: {} },
      allOf: [{ presentation: {} }],
      if: { controls: {} },
      then: { options: {} },
      else: { presentation: {} },
    };
    expect(stripSchema(schema)).toEqual({
      properties: { a: { type: 'string' } },
      items: {},
      allOf: [{}],
      if: {},
      then: {},
      else: {},
    });
  });

  it('preserves identical names inside literal data and unknown extension data', () => {
    const data = {
      controls: { x: 1 },
      options: { x: 2 },
      presentation: { x: 3 },
      properties: { a: { controls: {} } },
    };
    const schema = {
      type: 'object',
      controls: {},
      const: data,
      enum: [data],
      default: data,
      examples: [data],
      custom: data,
    };
    expect(stripSchema(schema)).toEqual({
      type: 'object',
      const: data,
      enum: [data],
      default: data,
      examples: [data],
      custom: data,
    });
    expect(data.controls).toEqual({ x: 1 });
  });

  it('strips modern applicators through the scanner vocabulary', () => {
    expect(
      stripSchema({
        patternProperties: { '^x': { controls: {} } },
        propertyNames: { options: {} },
        contains: { presentation: {} },
        dependentSchemas: { x: { controls: {} } },
        unevaluatedProperties: { options: {} },
        unevaluatedItems: { presentation: {} },
        prefixItems: [{ controls: {} }],
      }),
    ).toEqual({
      patternProperties: { '^x': {} },
      propertyNames: {},
      contains: {},
      dependentSchemas: { x: {} },
      unevaluatedProperties: {},
      unevaluatedItems: {},
      prefixItems: [{}],
    });
  });

  it('does not mutate frozen authored schemas or inline referenced definitions', () => {
    const child = Object.freeze({
      type: 'string',
      controls: Object.freeze({ active: true }),
    });
    const schema = Object.freeze({
      $ref: '#/$defs/item',
      $defs: Object.freeze({ item: child }),
    });
    expect(stripSchema(schema)).toEqual({
      $ref: '#/$defs/item',
      $defs: { item: { type: 'string' } },
    });
    expect(child.controls).toEqual({ active: true });
  });

  it('preserves property names equal to reserved group names', () => {
    expect(
      stripSchema({
        properties: {
          controls: { type: 'object', options: {} },
          options: { type: 'string', controls: {} },
          presentation: { type: 'number', presentation: {} },
        },
      }),
    ).toEqual({
      properties: {
        controls: { type: 'object' },
        options: { type: 'string' },
        presentation: { type: 'number' },
      },
    });
  });

  it('removes present undefined groups without stripping unknown top-level keys', () => {
    expect(
      stripSchema({
        type: 'string',
        controls: undefined,
        options: undefined,
        presentation: undefined,
        FormTypeInput: 'unknown data',
      }),
    ).toEqual({ type: 'string', FormTypeInput: 'unknown data' });
  });

  it('visits reference siblings and nested definitions without expanding recursive refs', () => {
    const schema = {
      $ref: '#/$defs/Node',
      $defs: {
        Node: {
          type: 'object',
          controls: {},
          properties: { child: { $ref: '#/$defs/Node', options: {} } },
          $defs: { Inner: { type: 'boolean', presentation: {} }, Never: false },
        },
      },
    };
    expect(stripSchema(schema)).toEqual({
      $ref: '#/$defs/Node',
      $defs: {
        Node: {
          type: 'object',
          properties: { child: { $ref: '#/$defs/Node' } },
          $defs: { Inner: { type: 'boolean' }, Never: false },
        },
      },
    });
    expect(schema.$defs.Node.controls).toEqual({});
  });

  it('preserves shared authored siblings and literal aliases while stripping schema occurrences', () => {
    const shared = {
      type: 'object',
      properties: { leaf: { type: 'string', controls: { active: true } } },
    };
    const schema = {
      type: 'object',
      properties: { a: shared, b: shared },
      default: shared,
    };
    const result = stripSchema(schema) as Record<string, any>;
    expect(result.properties.a).toEqual({
      type: 'object',
      properties: { leaf: { type: 'string' } },
    });
    expect(result.properties.b).toEqual(result.properties.a);
    expect(result.default).toEqual(shared);
    expect(result.default).toBe(shared);
    expect(schema.properties.a).toBe(schema.properties.b);
    expect(shared.properties.leaf.controls).toEqual({ active: true });
  });
});
