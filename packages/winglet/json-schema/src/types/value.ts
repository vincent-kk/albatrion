export type BooleanValue = boolean;
export type NumberValue = number;
export type StringValue = string;
export type ArrayValue = any[];
export type ObjectValue = Record<string, any>;
export type NullValue = null;
export type UndefinedValue = undefined;
export type AnyValue = any;

export type AllowedValue =
  | BooleanValue
  | NumberValue
  | StringValue
  | ObjectValue
  | ArrayValue
  | NullValue
  | UndefinedValue;

/** Helper type to check if a type array contains 'null' */
type HasNull<T> = T extends readonly (infer U)[]
  ? 'null' extends U
    ? true
    : false
  : false;

/** Helper type to extract the primary type from a type array (excluding 'null') */
type ExtractPrimaryType<T> = T extends readonly (infer U)[]
  ? Exclude<U, 'null'>
  : T;

/** Maps non-nullable schema types to their value types */
type InferNonNullableValueType<T> = T extends 'string'
  ? StringValue
  : T extends 'number' | 'integer'
    ? NumberValue
    : T extends 'boolean'
      ? BooleanValue
      : T extends 'array'
        ? ArrayValue
        : T extends 'object'
          ? ObjectValue
          : T extends 'null'
            ? NullValue
            : AnyValue;

/**
 * Infers the value type from a JSON Schema type definition.
 * - For single types (e.g., 'string'), returns the corresponding value type
 * - For nullable types (e.g., ['string', 'null']), returns the value type | null
 * - For pure null type, returns NullValue
 */
export type InferValueType<
  T extends { type?: string | readonly string[] | string[] },
> = T extends {
  type: infer Type;
}
  ? HasNull<Type> extends true
    ? InferNonNullableValueType<ExtractPrimaryType<Type>> | NullValue
    : InferNonNullableValueType<Type>
  : AnyValue;
