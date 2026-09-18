import { describe, expectTypeOf, it } from 'vitest';

import type {
  ArraySchema,
  BooleanSchema,
  InferJSONSchema,
  JSONSchema,
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

describe('InferJSONSchema type inference tests', () => {
  describe('Non-nullable types', () => {
    it('string → StringSchema', () => {
      expectTypeOf<InferJSONSchema<string>>().toExtend<StringSchema>();
    });
    it('number → NumberSchema', () => {
      expectTypeOf<InferJSONSchema<number>>().toExtend<NumberSchema>();
    });
    it('boolean → BooleanSchema', () => {
      expectTypeOf<InferJSONSchema<boolean>>().toExtend<BooleanSchema>();
    });
    it('array → ArraySchema', () => {
      expectTypeOf<InferJSONSchema<any[]>>().toExtend<ArraySchema>();
    });
    it('object → ObjectSchema', () => {
      expectTypeOf<
        InferJSONSchema<Record<string, any>>
      >().toExtend<ObjectSchema>();
    });
  });

  describe('Nullable types', () => {
    it('string | null → StringNullableSchema', () => {
      expectTypeOf<
        InferJSONSchema<string | null>
      >().toExtend<NullableStringSchema>();
    });
    it('number | null → NumberNullableSchema', () => {
      expectTypeOf<
        InferJSONSchema<number | null>
      >().toExtend<NullableNumberSchema>();
    });
    it('boolean | null → BooleanNullableSchema', () => {
      expectTypeOf<
        InferJSONSchema<boolean | null>
      >().toExtend<NullableBooleanSchema>();
    });
    it('array | null → ArrayNullableSchema', () => {
      expectTypeOf<
        InferJSONSchema<any[] | null>
      >().toExtend<NullableArraySchema>();
    });
    it('object | null → ObjectNullableSchema', () => {
      expectTypeOf<
        InferJSONSchema<Record<string, any> | null>
      >().toExtend<NullableObjectSchema>();
    });
  });

  describe('Pure null type', () => {
    it('null → NullSchema', () => {
      expectTypeOf<InferJSONSchema<null>>().toExtend<NullSchema>();
    });
  });

  describe('Edge cases', () => {
    it('unknown → JSONSchema', () => {
      expectTypeOf<InferJSONSchema<unknown>>().toExtend<JSONSchema>();
    });
    it('any → JSONSchema', () => {
      expectTypeOf<InferJSONSchema<any>>().toExtend<JSONSchema>();
    });
  });
});
