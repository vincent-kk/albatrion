import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const attempt = (fn: () => unknown) => {
  try {
    return fn();
  } catch (error) {
    return { error: String((error as any)?.code ?? error) };
  }
};

const effective = (field: any) =>
  attempt(() => {
    const root = tree({ type: 'object', properties: { n: field } }, {});
    const schema = root.find('/n').jsonSchema;
    return {
      minimum: schema.minimum,
      maximum: schema.maximum,
      exclusiveMinimum: schema.exclusiveMinimum,
      multipleOf: schema.multipleOf,
      enum: schema.enum,
      const: schema.const,
    };
  });

describe('BS2 numeric constraints merged through allOf', () => {
  it('minimum and maximum narrow', () => {
    expect(effective({ type: 'number', minimum: 0, maximum: 10, allOf: [{ minimum: 5 }, { maximum: 7 }] })).toMatchObject({
      minimum: 5,
      maximum: 7,
    });
  });

  it('multipleOf decimals combine to their least common multiple', () => {
    expect(effective({ type: 'number', multipleOf: 0.1, allOf: [{ multipleOf: 0.25 }] })).toMatchObject({ multipleOf: 0.5 });
    expect(effective({ type: 'number', multipleOf: 0.01, allOf: [{ multipleOf: 0.05 }] })).toMatchObject({ multipleOf: 0.05 });
  });

  it('enum intersection treats 0 and -0 as the same JSON number', () => {
    expect(effective({ type: 'number', enum: [0, 1], allOf: [{ enum: [-0, 2] }] })).toMatchObject({ enum: [0] });
  });

  it('const and enum treat 0 and -0 as the same JSON number', () => {
    expect(effective({ type: 'number', const: 0, allOf: [{ const: -0 }] })).toMatchObject({ const: 0 });
  });

  it('large integers keep exact bounds', () => {
    expect(
      effective({ type: 'integer', minimum: Number.MAX_SAFE_INTEGER - 1, allOf: [{ minimum: 1e21 }] }),
    ).toMatchObject({ minimum: 1e21 });
  });
});
