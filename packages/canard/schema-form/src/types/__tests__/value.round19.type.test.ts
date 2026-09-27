import { describe, expectTypeOf, it } from 'vitest';

import type { ObjectValue } from '@winglet/json-schema';

import type { InferValueType } from '../../index';

// filid:contract public-value-inference
describe('NODE-059 public value inference', () => {
  it('unites inline object branch values', () => {
    type Value = InferValueType<{
      oneOf: [
        {
          type: 'object';
          additionalProperties: false;
          properties: { cat: { type: 'string' } };
        },
        {
          type: 'object';
          additionalProperties: false;
          properties: { dog: { type: 'number' } };
        },
      ];
    }>;
    expectTypeOf<Value>().toEqualTypeOf<
      { cat?: string } | { dog?: number }
    >();
  });

  it('retains an explicit null branch and array item values', () => {
    type Nullable = InferValueType<{
      anyOf: [
        { type: 'object'; additionalProperties: false },
        { type: 'null' },
      ];
    }>;
    type Arrays = InferValueType<{
      oneOf: [
        { type: 'array'; items: { type: 'string' } },
        { type: 'array'; items: { type: 'number' } },
      ];
    }>;
    expectTypeOf<Nullable>().toEqualTypeOf<ObjectValue | null>();
    expectTypeOf<Arrays>().toEqualTypeOf<string[] | number[]>();
  });

  it('retains const and enum literals in unbranched fields', () => {
    expectTypeOf<InferValueType<{ const: 'cat' }>>().toEqualTypeOf<'cat'>();
    expectTypeOf<
      InferValueType<{ enum: readonly ['cat', 'dog', null] }>
    >().toEqualTypeOf<'cat' | 'dog' | null>();
  });

  it('keeps non-inline and gated hosts broad', () => {
    expectTypeOf<
      InferValueType<{ oneOf: [{ $ref: '#/$defs/cat' }] }>
    >().toBeAny();
    expectTypeOf<
      InferValueType<{
        oneOf: [{ type: 'object'; controls: { active: true } }];
      }>
    >().toBeAny();
    expectTypeOf<
      InferValueType<{
        oneOf: [{ type: 'object' }];
        anyOf: [{ type: 'object' }];
      }>
    >().toBeAny();
    expectTypeOf<
      InferValueType<{
        controls: { discriminator: 'kind' };
        oneOf: [{ type: 'object' }, { type: 'object' }];
      }>
    >().toBeAny();
    expectTypeOf<InferValueType<{ const: { id: 1 } }>>().toBeAny();
    expectTypeOf<
      InferValueType<{ enum: readonly ['cat', 1] }>
    >().toBeAny();
  });
});
