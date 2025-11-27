import type { Dictionary, IsNullable } from '@aileron/declare';

import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from './value';

// REF: https://github.com/ajv-validator/ajv/blob/master/lib/types/json-schema.ts

export type UnknownSchema = { type?: string | string[]; [key: string]: any };

/** Extracts the non-null type from a potentially nullable type */
type ExtractNonNull<T> = Exclude<T, null>;

/** Maps base types to their Non-Nullable Schema counterparts */
type InferNonNullableSchema<
  Value,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> = Value extends NumberValue
  ? NumberSchema<Options, Schema>
  : Value extends StringValue
    ? StringSchema<Options, Schema>
    : Value extends BooleanValue
      ? BooleanSchema<Options, Schema>
      : Value extends ArrayValue
        ? ArraySchema<Options, Schema>
        : Value extends ObjectValue
          ? ObjectSchema<Options, Schema>
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
    ? InferNullableSchema<ExtractNonNull<Value>, Options, Schema>
    : InferNonNullableSchema<Value, Options, Schema>;

export type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options, JsonSchema>
  | NullableNumberSchema<Options, JsonSchema>
  | StringSchema<Options, JsonSchema>
  | NullableStringSchema<Options, JsonSchema>
  | BooleanSchema<Options, JsonSchema>
  | NullableBooleanSchema<Options, JsonSchema>
  | ArraySchema<Options, JsonSchema>
  | NullableArraySchema<Options, JsonSchema>
  | ObjectSchema<Options, JsonSchema>
  | NullableObjectSchema<Options, JsonSchema>
  | NullSchema<Options, JsonSchema>;

export interface NumberSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseNumberSchema<NumberValue, Options, Schema> {
  type: 'number' | 'integer';
}

export interface NullableNumberSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseNumberSchema<NumberValue | null, Options, Schema> {
  type: ['number' | 'integer', 'null'];
}

interface BaseNumberSchema<
  Value,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<Value, Options, Schema> {
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  format?: string;
}

export interface StringSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseStringSchema<StringValue, Options, Schema> {
  type: 'string';
}

export interface NullableStringSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseStringSchema<StringValue | null, Options, Schema> {
  type: ['string', 'null'];
}

interface BaseStringSchema<
  Value,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<Value, Options, Schema> {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface BooleanSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<BooleanValue, Options, Schema> {
  type: 'boolean';
}

export interface NullableBooleanSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<BooleanValue | null, Options, Schema> {
  type: ['boolean', 'null'];
}

export interface ArraySchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseArraySchema<ArrayValue, Options, Schema> {
  type: 'array';
}

export interface NullableArraySchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseArraySchema<ArrayValue | null, Options, Schema> {
  type: ['array', 'null'];
}

interface BaseArraySchema<
  Value,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<Value, Options, Schema> {
  items: Schema;
  contains?: Partial<Schema>;
  minItems?: number;
  maxItems?: number;
  minContains?: number;
  maxContains?: number;
  uniqueItems?: boolean;
  additionalItems?: Partial<Schema> | boolean;
}

export interface ObjectSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseObjectSchema<ObjectValue, Options, Schema> {
  type: 'object';
}

export interface NullableObjectSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseObjectSchema<ObjectValue | null, Options, Schema> {
  type: ['object', 'null'];
}

interface BaseObjectSchema<
  Type,
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<Type, Options, Schema> {
  additionalProperties?: boolean | Partial<Schema>;
  unevaluatedProperties?: boolean | Partial<Schema>;
  properties?: Dictionary<Schema>;
  patternProperties?: Dictionary<Schema>;
  propertyNames?: Partial<Extract<Schema, { type: 'string' }>>;
  dependencies?: Dictionary<Partial<Schema> | string[]>;
  dependentRequired?: Dictionary<string[]>;
  dependentSchemas?: Dictionary<Partial<Schema>>;
  minProperties?: number;
  maxProperties?: number;
  required?: string[];
}

export interface NullSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<null, Options, Schema> {
  type: 'null';
}

export interface RefSchema {
  type?: undefined;
  $ref: string;
  [alt: string]: any;
}

export interface BasicSchema<
  Type,
  Options extends Dictionary,
  Schema extends UnknownSchema = JsonSchema,
> extends CustomOptions<Options> {
  $defs?: Dictionary<Schema>;
  if?: Partial<Schema>;
  then?: Partial<Schema>;
  else?: Partial<Schema>;
  not?: Partial<Schema>;
  allOf?: Partial<Schema>[];
  anyOf?: Partial<Schema>[];
  oneOf?: Partial<Schema>[];
  nullable?: boolean;
  const?: Type;
  default?: Type;
  enum?: Type[];
}

interface CustomOptions<Options extends Dictionary> {
  format?: string;
  active?: boolean;
  visible?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  options?: Options;
  [alt: string]: any;
}
