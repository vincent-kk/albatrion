import type { RefSchema } from '@winglet/json-schema';

import type { Dictionary, IsNullable, Roll } from '@aileron/declare';

import type {
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
} from '../schema/jsonSchema';
import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from '../schema/value';

type RolledNonNullableBooleanSchema<Options extends object = object> = Roll<
  NonNullableBooleanSchema<Options>
>;
type RolledNullableBooleanSchema<Options extends object = object> = Roll<
  NullableBooleanSchema<Options>
>;
type RolledBooleanSchema<Options extends object = object> =
  | RolledNonNullableBooleanSchema<Options>
  | RolledNullableBooleanSchema<Options>;

type RolledNonNullableNumberSchema<Options extends object = object> = Roll<
  NonNullableNumberSchema<Options>
>;
type RolledNullableNumberSchema<Options extends object = object> = Roll<
  NullableNumberSchema<Options>
>;
type RolledNumberSchema<Options extends object = object> =
  | RolledNonNullableNumberSchema<Options>
  | RolledNullableNumberSchema<Options>;

type RolledNonNullableStringSchema<Options extends object = object> = Roll<
  NonNullableStringSchema<Options>
>;
type RolledNullableStringSchema<Options extends object = object> = Roll<
  NullableStringSchema<Options>
>;
type RolledStringSchema<Options extends object = object> =
  | RolledNonNullableStringSchema<Options>
  | RolledNullableStringSchema<Options>;

type RolledNonNullableArraySchema<Options extends object = object> = Roll<
  NonNullableArraySchema<Options>
>;
type RolledNullableArraySchema<Options extends object = object> = Roll<
  NullableArraySchema<Options>
>;
type RolledArraySchema<Options extends object = object> =
  | RolledNonNullableArraySchema<Options>
  | RolledNullableArraySchema<Options>;

type RolledNonNullableObjectSchema<Options extends object = object> = Roll<
  NonNullableObjectSchema<Options>
>;
type RolledNullableObjectSchema<Options extends object = object> = Roll<
  NullableObjectSchema<Options>
>;
type RolledObjectSchema<Options extends object = object> =
  | RolledNonNullableObjectSchema<Options>
  | RolledNullableObjectSchema<Options>;

type RolledNullSchema<Options extends object = object> = Roll<
  NullSchema<Options>
>;

export type {
  RolledNonNullableBooleanSchema,
  RolledNullableBooleanSchema,
  RolledBooleanSchema,
  RolledNonNullableNumberSchema,
  RolledNullableNumberSchema,
  RolledNumberSchema,
  RolledNonNullableStringSchema,
  RolledNullableStringSchema,
  RolledStringSchema,
  RolledNonNullableArraySchema,
  RolledNullableArraySchema,
  RolledArraySchema,
  RolledNonNullableObjectSchema,
  RolledNullableObjectSchema,
  RolledObjectSchema,
  RolledNullSchema,
};

type RolledSchemaUnion<Options extends Dictionary = object> =
  | RolledNumberSchema<Options>
  | RolledStringSchema<Options>
  | RolledBooleanSchema<Options>
  | RolledArraySchema<Options>
  | RolledObjectSchema<Options>
  | RolledNullSchema<Options>
  | RefSchema;

/** Schema inference for non-nullable values */
type InferNonNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? RolledNonNullableNumberSchema<Options>
  : Value extends StringValue
    ? RolledNonNullableStringSchema<Options>
    : Value extends BooleanValue
      ? RolledNonNullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? RolledNonNullableArraySchema<Options>
        : Value extends ObjectValue
          ? RolledNonNullableObjectSchema<Options>
          : RolledSchemaUnion<Options>;

/** Schema inference for nullable values */
type InferNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? RolledNullableNumberSchema<Options>
  : Value extends StringValue
    ? RolledNullableStringSchema<Options>
    : Value extends BooleanValue
      ? RolledNullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? RolledNullableArraySchema<Options>
        : Value extends ObjectValue
          ? RolledNullableObjectSchema<Options>
          : RolledNullSchema<Options>;

/**
 * Infers the appropriate Schema type based on the input value.
 * - For nullable types (T | null), returns the corresponding Nullable schema
 * - For non-nullable types, returns the standard schema
 * - For pure null type, returns RolledNullSchema
 */
export type RolledInferJSONSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
> = [Value] extends [null]
  ? RolledNullSchema<Options>
  : IsNullable<Value> extends true
    ? InferNullableSchema<Exclude<Value, null>, Options>
    : InferNonNullableSchema<Value, Options>;
