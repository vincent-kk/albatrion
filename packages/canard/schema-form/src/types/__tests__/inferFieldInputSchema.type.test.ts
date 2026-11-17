import { describe, expectTypeOf, it } from 'vitest';

import type { InferFieldInputSchema } from '../field/inferFieldInputSchema';
import type {
  ArraySchema,
  BooleanSchema,
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
} from '../schema/jsonSchema';

describe('InferFieldInputSchema type inference tests', () => {
  describe('Non-nullable types', () => {
    it('string → StringSchema', () => {
      expectTypeOf<InferFieldInputSchema<string>>().toExtend<StringSchema>();
    });
    it('number → NumberSchema', () => {
      expectTypeOf<InferFieldInputSchema<number>>().toExtend<NumberSchema>();
    });
    it('boolean → BooleanSchema', () => {
      expectTypeOf<InferFieldInputSchema<boolean>>().toExtend<BooleanSchema>();
    });
    it('array → ArraySchema', () => {
      expectTypeOf<InferFieldInputSchema<any[]>>().toExtend<ArraySchema>();
    });
    it('object → ObjectSchema', () => {
      expectTypeOf<
        InferFieldInputSchema<Record<string, any>>
      >().toExtend<ObjectSchema>();
    });
  });

  describe('Nullable types', () => {
    it('string | null → StringNullableSchema', () => {
      expectTypeOf<
        InferFieldInputSchema<string | null>
      >().toExtend<NullableStringSchema>();
    });
    it('number | null → NumberNullableSchema', () => {
      expectTypeOf<
        InferFieldInputSchema<number | null>
      >().toExtend<NullableNumberSchema>();
    });
    it('boolean | null → BooleanNullableSchema', () => {
      expectTypeOf<
        InferFieldInputSchema<boolean | null>
      >().toExtend<NullableBooleanSchema>();
    });
    it('array | null → ArrayNullableSchema', () => {
      expectTypeOf<
        InferFieldInputSchema<any[] | null>
      >().toExtend<NullableArraySchema>();
    });
    it('object | null → ObjectNullableSchema', () => {
      expectTypeOf<
        InferFieldInputSchema<Record<string, any> | null>
      >().toExtend<NullableObjectSchema>();
    });
  });

  describe('Pure null type', () => {
    it('null → NullSchema', () => {
      expectTypeOf<InferFieldInputSchema<null>>().toExtend<NullSchema>();
    });
  });

  describe('Edge cases', () => {
    it('unknown → JSONSchema', () => {
      expectTypeOf<InferFieldInputSchema<unknown>>().toExtend<JSONSchema>();
    });
    it('any → JSONSchema', () => {
      expectTypeOf<InferFieldInputSchema<any>>().toExtend<JSONSchema>();
    });
  });
});
