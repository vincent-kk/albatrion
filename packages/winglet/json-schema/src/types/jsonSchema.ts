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
  ? NumberNullableSchema<Options, Schema>
  : Value extends StringValue
    ? StringNullableSchema<Options, Schema>
    : Value extends BooleanValue
      ? BooleanNullableSchema<Options, Schema>
      : Value extends ArrayValue
        ? ArrayNullableSchema<Options, Schema>
        : Value extends ObjectValue
          ? ObjectNullableSchema<Options, Schema>
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
    ? InferNullableSchema<Extract<Value, null>, Options, Schema>
    : InferNonNullableSchema<Value, Options, Schema>;

export type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options, JsonSchema>
  | NumberNullableSchema<Options, JsonSchema>
  | StringSchema<Options, JsonSchema>
  | StringNullableSchema<Options, JsonSchema>
  | BooleanSchema<Options, JsonSchema>
  | BooleanNullableSchema<Options, JsonSchema>
  | ArraySchema<Options, JsonSchema>
  | ArrayNullableSchema<Options, JsonSchema>
  | ObjectSchema<Options, JsonSchema>
  | ObjectNullableSchema<Options, JsonSchema>
  | NullSchema<Options, JsonSchema>;

export interface NumberSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseNumberSchema<NumberValue, Options, Schema> {
  type: 'number' | 'integer';
}

export interface NumberNullableSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseNumberSchema<NumberValue | null, Options, Schema> {
  type: Readonly<['number' | 'integer', 'null']>;
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

export interface StringNullableSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseStringSchema<StringValue | null, Options, Schema> {
  type: Readonly<['string', 'null']>;
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

export interface BooleanNullableSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<BooleanValue | null, Options, Schema> {
  type: Readonly<['boolean', 'null']>;
}

export interface ArraySchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseArraySchema<ArrayValue, Options, Schema> {
  type: 'array';
}

export interface ArrayNullableSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseArraySchema<ArrayValue | null, Options, Schema> {
  type: Readonly<['array', 'null']>;
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

export interface ObjectNullableSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BaseObjectSchema<ObjectValue | null, Options, Schema> {
  type: Readonly<['object', 'null']>;
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
