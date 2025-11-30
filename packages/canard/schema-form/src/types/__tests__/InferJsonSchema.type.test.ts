import { describe, expectTypeOf, it } from 'vitest';

import type {
  ArraySchema,
  BooleanSchema,
  InferJsonSchema,
  JsonSchema,
  NullSchema,
  NullableArraySchema,
  NullableBooleanSchema,
  NullableNumberSchema,
  NullableObjectSchema,
  NullableStringSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from '../jsonSchema';

describe('InferJsonSchema type inference tests', () => {
  describe('Non-nullable types', () => {
    it('string → StringSchema', () => {
      expectTypeOf<InferJsonSchema<string>>().toExtend<StringSchema>();
    });
    it('number → NumberSchema', () => {
      expectTypeOf<InferJsonSchema<number>>().toExtend<NumberSchema>();
    });
    it('boolean → BooleanSchema', () => {
      expectTypeOf<InferJsonSchema<boolean>>().toExtend<BooleanSchema>();
    });
    it('array → ArraySchema', () => {
      expectTypeOf<InferJsonSchema<any[]>>().toExtend<ArraySchema>();
    });
    it('object → ObjectSchema', () => {
      expectTypeOf<
        InferJsonSchema<Record<string, any>>
      >().toExtend<ObjectSchema>();
    });
  });

  describe('Nullable types', () => {
    it('string | null → StringNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<string | null>
      >().toExtend<NullableStringSchema>();
    });
    it('number | null → NumberNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<number | null>
      >().toExtend<NullableNumberSchema>();
    });
    it('boolean | null → BooleanNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<boolean | null>
      >().toExtend<NullableBooleanSchema>();
    });
    it('array | null → ArrayNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<any[] | null>
      >().toExtend<NullableArraySchema>();
    });
    it('object | null → ObjectNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<Record<string, any> | null>
      >().toExtend<NullableObjectSchema>();
    });
  });

  describe('Pure null type', () => {
    it('null → NullSchema', () => {
      expectTypeOf<InferJsonSchema<null>>().toExtend<NullSchema>();
    });
  });

  describe('Edge cases', () => {
    it('unknown → JsonSchema', () => {
      expectTypeOf<InferJsonSchema<unknown>>().toExtend<JsonSchema>();
    });
    it('any → JsonSchema', () => {
      expectTypeOf<InferJsonSchema<any>>().toExtend<JsonSchema>();
    });
  });
});
