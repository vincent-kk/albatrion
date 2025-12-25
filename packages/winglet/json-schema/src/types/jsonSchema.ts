import type { Dictionary, IsNullable, Nullable } from '@aileron/declare';

import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from './value';

// REF: https://github.com/ajv-validator/ajv/blob/master/lib/types/json-schema.ts

/** Base type for any JSON Schema definition */
export type UnknownSchema = {
  type?: string | Readonly<string[]>;
  [key: string]: any;
};

/** Maps base types to their Non-Nullable Schema counterparts */
type InferNonNullableSchema<
  Value,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> = Value extends NumberValue
  ? NonNullableNumberSchema<Options, Schema>
  : Value extends StringValue
    ? NonNullableStringSchema<Options, Schema>
    : Value extends BooleanValue
      ? NonNullableBooleanSchema<Options, Schema>
      : Value extends ArrayValue
        ? NonNullableArraySchema<Options, Schema>
        : Value extends ObjectValue
          ? NonNullableObjectSchema<Options, Schema>
          : JsonSchema<Options>;

/** Maps base types to their Nullable Schema counterparts */
type InferNullableSchema<
  Value,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> = Value extends NumberValue
  ? NullableNumberSchema<Options, Schema>
  : Value extends StringValue
    ? NullableStringSchema<Options, Schema>
    : Value extends BooleanValue
      ? NullableBooleanSchema<Options, Schema>
      : Value extends ArrayValue
        ? NullableArraySchema<Options, Schema>
        : Value extends ObjectValue
          ? NullableObjectSchema<Options, Schema>
          : NullSchema<Options, Schema>;

/**
 * Infers the appropriate Schema type based on the input value.
 * - For nullable types (T | null), returns the corresponding Nullable schema
 * - For non-nullable types, returns the standard schema
 * - For pure null type, returns NullSchema
 *
 * Uses [T] extends [U] pattern to prevent distributive conditional types
 */
export type InferJsonSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> = [Value] extends [null]
  ? NullSchema<Options, Schema>
  : IsNullable<Value> extends true
    ? InferNullableSchema<Exclude<Value, null>, Options, Schema>
    : InferNonNullableSchema<Value, Options, Schema>;

/** Standard JSON Schema union type */
export type JsonSchema<Options extends Dictionary = object> =
  | NonNullableNumberSchema<Options, JsonSchema>
  | NullableNumberSchema<Options, JsonSchema>
  | NonNullableStringSchema<Options, JsonSchema>
  | NullableStringSchema<Options, JsonSchema>
  | NonNullableBooleanSchema<Options, JsonSchema>
  | NullableBooleanSchema<Options, JsonSchema>
  | NonNullableArraySchema<Options, JsonSchema>
  | NullableArraySchema<Options, JsonSchema>
  | NonNullableObjectSchema<Options, JsonSchema>
  | NullableObjectSchema<Options, JsonSchema>
  | NullSchema<Options, JsonSchema>;

/** Number/Integer type schema */
export type NumberSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> =
  | NonNullableNumberSchema<Options, Schema>
  | NullableNumberSchema<Options, Schema>;

/** Non-nullable number schema (type: 'number' | 'integer') */
export interface NonNullableNumberSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseNumberSchema<NumberValue, Options, Schema> {
  type: 'number' | 'integer';
}

/** Nullable number schema (type: ['number' | 'integer', 'null']) */
export interface NullableNumberSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseNumberSchema<NumberValue, Options, Schema> {
  type:
    | Readonly<['number' | 'integer', 'null']>
    | Readonly<['null', 'number' | 'integer']>;
}

/** Base number schema with numeric constraints */
interface BaseNumberSchema<
  Value,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<Value, Options, Schema> {
  /** Minimum value (inclusive) */
  minimum?: number;
  /** Maximum value (inclusive) */
  maximum?: number;
  /** Minimum value (exclusive) */
  exclusiveMinimum?: number;
  /** Maximum value (exclusive) */
  exclusiveMaximum?: number;
  /** Value must be a multiple of this number */
  multipleOf?: number;
  /** String format hint (e.g., 'float', 'double') */
  format?: string;
}

/** String type schema */
export type StringSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> =
  | NonNullableStringSchema<Options, Schema>
  | NullableStringSchema<Options, Schema>;

/** Non-nullable string schema (type: 'string') */
export interface NonNullableStringSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseStringSchema<StringValue, Options, Schema> {
  type: 'string';
}

/** Nullable string schema (type: ['string', 'null']) */
export interface NullableStringSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseStringSchema<StringValue, Options, Schema> {
  type: Readonly<['string', 'null']> | Readonly<['null', 'string']>;
}

/** Base string schema with string constraints */
interface BaseStringSchema<
  Value,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<Value, Options, Schema> {
  /** Minimum string length */
  minLength?: number;
  /** Maximum string length */
  maxLength?: number;
  /** Regular expression pattern */
  pattern?: string;
  /** String format hint (e.g., 'email', 'date', 'uri') */
  format?: string;
}

/** Boolean type schema */
export type BooleanSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> =
  | NonNullableBooleanSchema<Options, Schema>
  | NullableBooleanSchema<Options, Schema>;

/** Non-nullable boolean schema (type: 'boolean') */
export interface NonNullableBooleanSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<BooleanValue, Options, Schema> {
  type: 'boolean';
}

/** Nullable boolean schema (type: ['boolean', 'null']) */
export interface NullableBooleanSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<BooleanValue, Options, Schema> {
  type: Readonly<['boolean', 'null']> | Readonly<['null', 'boolean']>;
}

/** Array type schema */
export type ArraySchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> =
  | NonNullableArraySchema<Options, Schema>
  | NullableArraySchema<Options, Schema>;

/** Non-nullable array schema (type: 'array') */
export interface NonNullableArraySchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseArraySchema<ArrayValue, Options, Schema> {
  type: 'array';
}

/** Nullable array schema (type: ['array', 'null']) */
export interface NullableArraySchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseArraySchema<ArrayValue, Options, Schema> {
  type: Readonly<['array', 'null']> | Readonly<['null', 'array']>;
}

/** Base array schema with array constraints */
interface BaseArraySchema<
  Value,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<Value, Options, Schema> {
  /** Schema for all array items */
  items?: Schema | false;
  /** Schema for all array items */
  prefixItems?: Schema[];
  /** Schema for items that must be present */
  contains?: Partial<Schema>;
  /** Minimum number of items */
  minItems?: number;
  /** Maximum number of items */
  maxItems?: number;
  /** Minimum number of items matching 'contains' */
  minContains?: number;
  /** Maximum number of items matching 'contains' */
  maxContains?: number;
  /** Whether all items must be unique */
  uniqueItems?: boolean;
  /** Schema for additional items beyond 'items' */
  additionalItems?: Partial<Schema> | boolean;
}

/** Object type schema */
export type ObjectSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> =
  | NonNullableObjectSchema<Options, Schema>
  | NullableObjectSchema<Options, Schema>;

/** Non-nullable object schema (type: 'object') */
export interface NonNullableObjectSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseObjectSchema<ObjectValue, Options, Schema> {
  type: 'object';
}

/** Nullable object schema (type: ['object', 'null']) */
export interface NullableObjectSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseObjectSchema<ObjectValue, Options, Schema> {
  type: Readonly<['object', 'null']> | Readonly<['null', 'object']>;
}

/** Base object schema with object constraints */
interface BaseObjectSchema<
  Type,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<Type, Options, Schema> {
  /** Schema for additional properties not in 'properties' */
  additionalProperties?: boolean | Partial<Schema>;
  /** Schema for unevaluated properties */
  unevaluatedProperties?: boolean | Partial<Schema>;
  /** Schema definitions for specific properties */
  properties?: Dictionary<Schema>;
  /** Schema definitions for properties matching regex patterns */
  patternProperties?: Dictionary<Schema>;
  /** Schema for property names */
  propertyNames?: Partial<Extract<Schema, { type: StringSchema['type'] }>>;
  /** Property dependencies (deprecated, use dependentSchemas) */
  dependencies?: Dictionary<Partial<Schema> | string[]>;
  /** Required properties when another property is present */
  dependentRequired?: Dictionary<string[]>;
  /** Schema dependencies when another property is present */
  dependentSchemas?: Dictionary<Partial<Schema>>;
  /** Minimum number of properties */
  minProperties?: number;
  /** Maximum number of properties */
  maxProperties?: number;
  /** List of required property names */
  required?: string[];
}

/** Null type schema */
export interface NullSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<null, Options, Schema> {
  type: 'null';
}

/** JSON Schema $ref reference */
export interface RefSchema {
  type?: undefined;
  /** JSON Pointer reference to another schema */
  $ref: string;
  [alt: string]: any;
}

/** Base properties common to all schema types */
export interface BasicSchema<
  Type,
  Options extends Dictionary,
  Schema extends UnknownSchema = JsonSchema,
> extends CustomOptions<Options> {
  /** Schema definitions for reusable schemas */
  $defs?: Dictionary<Schema>;
  /** Conditional schema (if-then-else) */
  if?: Partial<Schema>;
  /** Schema to apply if 'if' is valid */
  then?: Partial<Schema>;
  /** Schema to apply if 'if' is invalid */
  else?: Partial<Schema>;
  /** Schema that must NOT be valid */
  not?: Partial<Schema>;
  /** All schemas must be valid */
  allOf?: Partial<Schema>[];
  /** At least one schema must be valid */
  anyOf?: Partial<Schema>[];
  /** Exactly one schema must be valid */
  oneOf?: Partial<Schema>[];
  /** Whether the value can be null (deprecated, use type array) */
  nullable?: boolean;
  /** Constant value constraint */
  const?: Nullable<Type>;
  /** Default value */
  default?: Nullable<Type>;
  /** Enumeration of allowed values */
  enum?: Nullable<Type>[];
}

/** Custom options for schema extensions */
interface CustomOptions<Options extends Dictionary> {
  /** Format hint (e.g., 'email', 'date', 'uri') */
  format?: string;
  /** Whether field is active */
  active?: boolean;
  /** Whether field is visible */
  visible?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Custom options specific to implementation */
  options?: Options;
  [alt: string]: any;
}
