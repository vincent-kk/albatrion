import { describe, expectTypeOf, it } from 'vitest';

import type {
  BaseArraySchema,
  BaseBooleanSchema,
  BaseInferJSONSchema,
  BaseNullSchema,
  BaseNullableArraySchema,
  BaseNullableBooleanSchema,
  BaseNullableNumberSchema,
  BaseNullableObjectSchema,
  BaseNullableStringSchema,
  BaseNumberSchema,
  BaseObjectSchema,
  BaseStringSchema,
  JSONSchema,
} from '../internal/jsonSchema';

describe('BaseInferJSONSchema type inference tests', () => {
  describe('Non-nullable types', () => {
    it('string → BaseStringSchema', () => {
      expectTypeOf<BaseInferJSONSchema<string>>().toExtend<BaseStringSchema>();
    });
    it('number → BaseNumberSchema', () => {
      expectTypeOf<BaseInferJSONSchema<number>>().toExtend<BaseNumberSchema>();
    });
    it('boolean → BaseBooleanSchema', () => {
      expectTypeOf<
        BaseInferJSONSchema<boolean>
      >().toExtend<BaseBooleanSchema>();
    });
    it('array → BaseArraySchema', () => {
      expectTypeOf<BaseInferJSONSchema<any[]>>().toExtend<BaseArraySchema>();
    });
    it('object → BaseObjectSchema', () => {
      expectTypeOf<
        BaseInferJSONSchema<Record<string, any>>
      >().toExtend<BaseObjectSchema>();
    });
  });

  describe('Nullable types', () => {
    it('string | null → StringNullableSchema', () => {
      expectTypeOf<
        BaseInferJSONSchema<string | null>
      >().toExtend<BaseNullableStringSchema>();
    });
    it('number | null → NumberNullableSchema', () => {
      expectTypeOf<
        BaseInferJSONSchema<number | null>
      >().toExtend<BaseNullableNumberSchema>();
    });
    it('boolean | null → BooleanNullableSchema', () => {
      expectTypeOf<
        BaseInferJSONSchema<boolean | null>
      >().toExtend<BaseNullableBooleanSchema>();
    });
    it('array | null → ArrayNullableSchema', () => {
      expectTypeOf<
        BaseInferJSONSchema<any[] | null>
      >().toExtend<BaseNullableArraySchema>();
    });
    it('object | null → ObjectNullableSchema', () => {
      expectTypeOf<
        BaseInferJSONSchema<Record<string, any> | null>
      >().toExtend<BaseNullableObjectSchema>();
    });
  });

  describe('Pure null type', () => {
    it('null → BaseNullSchema', () => {
      expectTypeOf<BaseInferJSONSchema<null>>().toExtend<BaseNullSchema>();
    });
  });

  describe('Edge cases', () => {
    it('unknown → JSONSchema', () => {
      expectTypeOf<BaseInferJSONSchema<unknown>>().toExtend<JSONSchema>();
    });
    it('any → JSONSchema', () => {
      expectTypeOf<BaseInferJSONSchema<any>>().toExtend<JSONSchema>();
    });
  });
});
