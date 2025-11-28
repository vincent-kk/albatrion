import type { RefSchema } from '@winglet/json-schema';

import type { Dictionary, IsNullable, Roll } from '@aileron/declare';

import type {
  NonNullableArraySchema as BaseNonNullableArraySchema,
  NonNullableBooleanSchema as BaseNonNullableBooleanSchema,
  NonNullableNumberSchema as BaseNonNullableNumberSchema,
  NonNullableObjectSchema as BaseNonNullableObjectSchema,
  NonNullableStringSchema as BaseNonNullableStringSchema,
  NullSchema as BaseNullSchema,
  NullableArraySchema as BaseNullableArraySchema,
  NullableBooleanSchema as BaseNullableBooleanSchema,
  NullableNumberSchema as BaseNullableNumberSchema,
  NullableObjectSchema as BaseNullableObjectSchema,
  NullableStringSchema as BaseNullableStringSchema,
} from '../jsonSchema';
import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from '../value';

type NonNullableBooleanSchema<Options extends object = object> = Roll<
  BaseNonNullableBooleanSchema<Options>
>;
type NullableBooleanSchema<Options extends object = object> = Roll<
  BaseNullableBooleanSchema<Options>
>;
type BooleanSchema<Options extends object = object> =
  | NonNullableBooleanSchema<Options>
  | NullableBooleanSchema<Options>;

type NonNullableNumberSchema<Options extends object = object> = Roll<
  BaseNonNullableNumberSchema<Options>
>;
type NullableNumberSchema<Options extends object = object> = Roll<
  BaseNullableNumberSchema<Options>
>;
type NumberSchema<Options extends object = object> =
  | NonNullableNumberSchema<Options>
  | NullableNumberSchema<Options>;

type NonNullableStringSchema<Options extends object = object> = Roll<
  BaseNonNullableStringSchema<Options>
>;
type NullableStringSchema<Options extends object = object> = Roll<
  BaseNullableStringSchema<Options>
>;
type StringSchema<Options extends object = object> =
  | NonNullableStringSchema<Options>
  | NullableStringSchema<Options>;

type NonNullableArraySchema<Options extends object = object> = Roll<
  BaseNonNullableArraySchema<Options>
>;
type NullableArraySchema<Options extends object = object> = Roll<
  BaseNullableArraySchema<Options>
>;
type ArraySchema<Options extends object = object> =
  | NonNullableArraySchema<Options>
  | NullableArraySchema<Options>;

type NonNullableObjectSchema<Options extends object = object> = Roll<
  BaseNonNullableObjectSchema<Options>
>;
type NullableObjectSchema<Options extends object = object> = Roll<
  BaseNullableObjectSchema<Options>
>;
type ObjectSchema<Options extends object = object> =
  | NonNullableObjectSchema<Options>
  | NullableObjectSchema<Options>;

type NullSchema<Options extends object = object> = Roll<
  BaseNullSchema<Options>
>;

export type {
  NonNullableBooleanSchema,
  NullableBooleanSchema,
  BooleanSchema,
  NonNullableNumberSchema,
  NullableNumberSchema,
  NumberSchema,
  NonNullableStringSchema,
  NullableStringSchema,
  StringSchema,
  NonNullableArraySchema,
  NullableArraySchema,
  ArraySchema,
  NonNullableObjectSchema,
  NullableObjectSchema,
  ObjectSchema,
  NullSchema,
};

export type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options>
  | StringSchema<Options>
  | BooleanSchema<Options>
  | ArraySchema<Options>
  | ObjectSchema<Options>
  | NullSchema<Options>
  | RefSchema;

/** Schema inference for non-nullable values */
type InferNonNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NonNullableNumberSchema<Options>
  : Value extends StringValue
    ? NonNullableStringSchema<Options>
    : Value extends BooleanValue
      ? NonNullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? NonNullableArraySchema<Options>
        : Value extends ObjectValue
          ? NonNullableObjectSchema<Options>
          : JsonSchema<Options>;

/** Schema inference for nullable values */
type InferNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NullableNumberSchema<Options>
  : Value extends StringValue
    ? NullableStringSchema<Options>
    : Value extends BooleanValue
      ? NullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? NullableArraySchema<Options>
        : Value extends ObjectValue
          ? NullableObjectSchema<Options>
          : NullSchema<Options>;

/**
 * Infers the appropriate Schema type based on the input value.
 * - For nullable types (T | null), returns the corresponding Nullable schema
 * - For non-nullable types, returns the standard schema
 * - For pure null type, returns NullSchema
 */
export type InferJsonSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
> = [Value] extends [null]
  ? NullSchema<Options>
  : IsNullable<Value> extends true
    ? InferNullableSchema<Exclude<Value, null>, Options>
    : InferNonNullableSchema<Value, Options>;
