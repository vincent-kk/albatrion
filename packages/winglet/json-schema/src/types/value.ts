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

/** Helper type to narrow a property to something InferValueType accepts */
type InferPropertyValue<T> = T extends { type?: any }
  ? InferValueType<T>
  : AnyValue;

/**
 * Infers an array schema's value type from `items`.
 * Falls back to ArrayValue when `items` is absent.
 */
type InferArrayValue<T> = T extends { items: infer Items }
  ? InferPropertyValue<Items>[]
  : ArrayValue;

/**
 * Helper type to shape a schema's declared `properties`.
 *
 * Every key is optional, including those listed in `required`. A consumer of the
 * inferred value cannot rely on a required key being present: a form may drop it
 * at runtime (an inactive `computed.active` branch, `options.omitEmpty`), so
 * marking it required would let `value.key` type-check and then be undefined.
 * Callers who know the exact shape should declare it and pass it explicitly
 * instead of relying on this inference.
 *
 * `-readonly` strips the modifier an `as const` schema would otherwise propagate:
 * the schema is frozen, the value it describes is not.
 */
type InferDeclaredProperties<Properties> = {
  -readonly [Key in keyof Properties]?: InferPropertyValue<Properties[Key]>;
};

/**
 * Infers an object schema's value type from `properties`.
 *
 * The result stays open (intersected with ObjectValue) unless the schema sets
 * `additionalProperties: false`. Open is the JSON Schema default, and it is what
 * keeps keys contributed by applicators this type does not model — `oneOf`/`anyOf`
 * branches, `if`/`then`/`else`, `patternProperties`, `dependentSchemas`, `$ref` —
 * from being rejected as excess properties. Closing the type on
 * `additionalProperties: false` is what the schema itself asks for.
 *
 * Falls back to ObjectValue when `properties` is absent or keyed by plain `string`
 * (e.g. `Dictionary<JsonSchema>`), which keeps non-literal schemas behaving as before.
 */
type InferObjectValue<T> = T extends { properties: infer Properties }
  ? string extends keyof Properties
    ? ObjectValue
    : T extends { additionalProperties: false }
      ? InferDeclaredProperties<Properties>
      : InferDeclaredProperties<Properties> & ObjectValue
  : ObjectValue;

/** Maps non-nullable schema types to their value types */
type InferNonNullableValueType<T, Type> = Type extends 'string'
  ? StringValue
  : Type extends 'number' | 'integer'
    ? NumberValue
    : Type extends 'boolean'
      ? BooleanValue
      : Type extends 'array'
        ? InferArrayValue<T>
        : Type extends 'object'
          ? InferObjectValue<T>
          : Type extends 'null'
            ? NullValue
            : AnyValue;

/**
 * Infers the value type from a JSON Schema type definition.
 * - For single types (e.g., 'string'), returns the corresponding value type
 * - For nullable types (e.g., ['string', 'null']), returns the value type | null
 * - For pure null type, returns NullValue
 * - For 'object'/'array', recurses into `properties`/`items` when they are literal
 *   (i.e. the schema is `as const`); otherwise falls back to ObjectValue/ArrayValue
 */
export type InferValueType<
  T extends { type?: string | readonly string[] | string[] },
> = T extends {
  type: infer Type;
}
  ? HasNull<Type> extends true
    ? InferNonNullableValueType<T, ExtractPrimaryType<Type>> | NullValue
    : InferNonNullableValueType<T, Type>
  : AnyValue;
