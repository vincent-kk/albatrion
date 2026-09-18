import { describe, expectTypeOf, it } from 'vitest';

import type {
  InferJSONSchema,
  JSONSchema,
  NonNullableArraySchema,
  NonNullableBooleanSchema,
  NonNullableNumberSchema,
  NonNullableObjectSchema,
  NonNullableStringSchema,
  NullSchema,
  NullableArraySchema,
  NullableBooleanSchema,
  NullableNumberSchema,
  NullableObjectSchema,
  NullableStringSchema,
} from '../jsonSchema';

describe('InferJSONSchema 타입 추론 테스트', () => {
  describe('Non-nullable 타입', () => {
    it('string → StringSchema', () => {
      expectTypeOf<
        InferJSONSchema<string>
      >().toExtend<NonNullableStringSchema>();
    });

    it('number → NumberSchema', () => {
      expectTypeOf<
        InferJSONSchema<number>
      >().toExtend<NonNullableNumberSchema>();
    });

    it('boolean → BooleanSchema', () => {
      expectTypeOf<
        InferJSONSchema<boolean>
      >().toExtend<NonNullableBooleanSchema>();
    });

    it('array → ArraySchema', () => {
      expectTypeOf<InferJSONSchema<any[]>>().toExtend<NonNullableArraySchema>();
    });

    it('object → ObjectSchema', () => {
      expectTypeOf<
        InferJSONSchema<Record<string, any>>
      >().toExtend<NonNullableObjectSchema>();
    });
  });

  describe('Nullable 타입', () => {
    it('string | null → NullableStringSchema', () => {
      expectTypeOf<
        InferJSONSchema<string | null>
      >().toExtend<NullableStringSchema>();
    });

    it('number | null → NullableNumberSchema', () => {
      expectTypeOf<
        InferJSONSchema<number | null>
      >().toExtend<NullableNumberSchema>();
    });

    it('boolean | null → NullableBooleanSchema', () => {
      expectTypeOf<
        InferJSONSchema<boolean | null>
      >().toExtend<NullableBooleanSchema>();
    });

    it('array | null → NullableArraySchema', () => {
      expectTypeOf<
        InferJSONSchema<any[] | null>
      >().toExtend<NullableArraySchema>();
    });

    it('object | null → NullableObjectSchema', () => {
      expectTypeOf<
        InferJSONSchema<Record<string, any> | null>
      >().toExtend<NullableObjectSchema>();
    });
  });

  describe('순수 null 타입', () => {
    it('null → NullSchema', () => {
      expectTypeOf<InferJSONSchema<null>>().toExtend<NullSchema>();
    });
  });

  describe('Edge cases', () => {
    it('unknown → JSONSchema', () => {
      expectTypeOf<InferJSONSchema<unknown>>().toExtend<JSONSchema>();
    });

    it('any → JSONSchema (default)', () => {
      expectTypeOf<InferJSONSchema<any>>().toExtend<JSONSchema>();
    });
  });
});
