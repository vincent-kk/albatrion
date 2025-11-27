import { describe, expectTypeOf, it } from 'vitest';

import type {
  ArrayNullableSchema,
  ArraySchema,
  BooleanNullableSchema,
  BooleanSchema,
  InferJsonSchema,
  JsonSchema,
  NullSchema,
  NumberNullableSchema,
  NumberSchema,
  ObjectNullableSchema,
  ObjectSchema,
  StringNullableSchema,
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
    it('string | null → StringNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<string | null>
      >().toExtend<StringNullableSchema>();
    });
    it('number | null → NumberNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<number | null>
      >().toExtend<NumberNullableSchema>();
    });
    it('boolean | null → BooleanNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<boolean | null>
      >().toExtend<BooleanNullableSchema>();
    });
    it('array | null → ArrayNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<any[] | null>
      >().toExtend<ArrayNullableSchema>();
    });
    it('object | null → ObjectNullableSchema', () => {
      expectTypeOf<
        InferJsonSchema<Record<string, any> | null>
      >().toExtend<ObjectNullableSchema>();
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
    it('any → JsonSchema', () => {
      expectTypeOf<InferJsonSchema<any>>().toExtend<JsonSchema>();
    });
  });
});
