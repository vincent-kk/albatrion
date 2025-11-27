import { describe, expectTypeOf, it } from 'vitest';

import type {
  ArraySchema,
  BooleanSchema,
  InferJsonSchema,
  JsonSchema,
  NullableArraySchema,
  NullableBooleanSchema,
  NullableNumberSchema,
  NullableObjectSchema,
  NullableStringSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from '../jsonSchema';

describe('InferJsonSchema 타입 추론 테스트', () => {
  describe('Non-nullable 타입', () => {
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

  describe('Nullable 타입', () => {
    it('string | null → NullableStringSchema', () => {
      expectTypeOf<
        InferJsonSchema<string | null>
      >().toExtend<NullableStringSchema>();
    });

    it('number | null → NullableNumberSchema', () => {
      expectTypeOf<
        InferJsonSchema<number | null>
      >().toExtend<NullableNumberSchema>();
    });

    it('boolean | null → NullableBooleanSchema', () => {
      expectTypeOf<
        InferJsonSchema<boolean | null>
      >().toExtend<NullableBooleanSchema>();
    });

    it('array | null → NullableArraySchema', () => {
      expectTypeOf<
        InferJsonSchema<any[] | null>
      >().toExtend<NullableArraySchema>();
    });

    it('object | null → NullableObjectSchema', () => {
      expectTypeOf<
        InferJsonSchema<Record<string, any> | null>
      >().toExtend<NullableObjectSchema>();
    });
  });

  describe('순수 null 타입', () => {
    it('null → NullSchema', () => {
      expectTypeOf<InferJsonSchema<null>>().toExtend<NullSchema>();
    });
  });

  describe('Edge cases', () => {
    it('unknown → JsonSchema', () => {
      expectTypeOf<InferJsonSchema<unknown>>().toExtend<JsonSchema>();
    });

    it('any → JsonSchema (default)', () => {
      expectTypeOf<InferJsonSchema<any>>().toExtend<JsonSchema>();
    });
  });
});
