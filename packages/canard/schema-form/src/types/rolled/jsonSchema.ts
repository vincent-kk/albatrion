import type { RefSchema } from '@winglet/json-schema';

import type { Dictionary, IsNullable, Roll } from '@aileron/declare';

import type {
  ArrayNullableSchema as BaseArrayNullableSchema,
  ArraySchema as BaseArraySchema,
  BooleanNullableSchema as BaseBooleanNullableSchema,
  BooleanSchema as BaseBooleanSchema,
  NullSchema as BaseNullSchema,
  NumberNullableSchema as BaseNumberNullableSchema,
  NumberSchema as BaseNumberSchema,
  ObjectNullableSchema as BaseObjectNullableSchema,
  ObjectSchema as BaseObjectSchema,
  StringNullableSchema as BaseStringNullableSchema,
  StringSchema as BaseStringSchema,
} from '../jsonSchema';
import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from '../value';

type BooleanSchema<Options extends object = object> = Roll<
  BaseBooleanSchema<Options>
>;
type BooleanNullableSchema<Options extends object = object> = Roll<
  BaseBooleanNullableSchema<Options>
>;
type NumberSchema<Options extends object = object> = Roll<
  BaseNumberSchema<Options>
>;
type NumberNullableSchema<Options extends object = object> = Roll<
  BaseNumberNullableSchema<Options>
>;
type StringSchema<Options extends object = object> = Roll<
  BaseStringSchema<Options>
>;
type StringNullableSchema<Options extends object = object> = Roll<
  BaseStringNullableSchema<Options>
>;
type ArraySchema<Options extends object = object> = Roll<
  BaseArraySchema<Options>
>;
type ArrayNullableSchema<Options extends object = object> = Roll<
  BaseArrayNullableSchema<Options>
>;
type ObjectSchema<Options extends object = object> = Roll<
  BaseObjectSchema<Options>
>;
type ObjectNullableSchema<Options extends object = object> = Roll<
  BaseObjectNullableSchema<Options>
>;
type NullSchema<Options extends object = object> = Roll<
  BaseNullSchema<Options>
>;

export type {
  BooleanSchema,
  BooleanNullableSchema,
  NumberSchema,
  NumberNullableSchema,
  StringSchema,
  StringNullableSchema,
  ArraySchema,
  ArrayNullableSchema,
  ObjectSchema,
  ObjectNullableSchema,
  NullSchema,
};

export type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options>
  | NumberNullableSchema<Options>
  | StringSchema<Options>
  | StringNullableSchema<Options>
  | BooleanSchema<Options>
  | BooleanNullableSchema<Options>
  | ArraySchema<Options>
  | ArrayNullableSchema<Options>
  | ObjectSchema<Options>
  | ObjectNullableSchema<Options>
  | NullSchema<Options>
  | RefSchema;

/** null을 제외한 타입 추출 */
type ExtractNonNull<T> = Exclude<T, null>;

/** Non-nullable 값에 대한 스키마 추론 */
type InferNonNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NumberSchema<Options>
  : Value extends StringValue
    ? StringSchema<Options>
    : Value extends BooleanValue
      ? BooleanSchema<Options>
      : Value extends ArrayValue
        ? ArraySchema<Options>
        : Value extends ObjectValue
          ? ObjectSchema<Options>
          : JsonSchema<Options>;

/** Nullable 값에 대한 스키마 추론 */
type InferNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NumberNullableSchema<Options>
  : Value extends StringValue
    ? StringNullableSchema<Options>
    : Value extends BooleanValue
      ? BooleanNullableSchema<Options>
      : Value extends ArrayValue
        ? ArrayNullableSchema<Options>
        : Value extends ObjectValue
          ? ObjectNullableSchema<Options>
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
    ? InferNullableSchema<ExtractNonNull<Value>, Options>
    : InferNonNullableSchema<Value, Options>;
