import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from './value';

// REF: https://github.com/ajv-validator/ajv/blob/master/lib/types/json-schema.ts

type Dictionary<Value = any> = Record<string, Value>;

export type UnknownSchema = { type?: string; [key: string]: any };

/** Infers the appropriate Schema type based on the input value */
export type InferJsonSchema<
  Value extends AllowedValue | unknown = any,
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
          : Value extends null
            ? NullSchema<Options, Schema>
            : JsonSchema<Options>;

export type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options, JsonSchema>
  | StringSchema<Options, JsonSchema>
  | BooleanSchema<Options, JsonSchema>
  | ArraySchema<Options, JsonSchema>
  | ObjectSchema<Options, JsonSchema>
  | NullSchema<Options, JsonSchema>;

export interface NumberSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<NumberValue, Options, Schema> {
  type: 'number' | 'integer';
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
> extends BasicSchema<StringValue, Options, Schema> {
  type: 'string';
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

export interface ArraySchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<ArrayValue, Options, Schema> {
  type: 'array';
  items: Schema;
  contains?: Partial<Schema>;
  minItems?: number;
  maxItems?: number;
  minContains?: number;
  maxContains?: number;
  uniqueItems?: true;
  additionalItems?: never;
}

export interface ObjectSchema<
  Options extends Dictionary = object,
  Schema extends UnknownSchema = JsonSchema,
> extends BasicSchema<ObjectValue, Options, Schema> {
  type: 'object';
  additionalProperties?: boolean | Schema;
  unevaluatedProperties?: boolean | Schema;
  properties?: Dictionary<Schema>;
  patternProperties?: Dictionary<Schema>;
  propertyNames?: Schema['type'] extends 'string' ? Partial<Schema> : never;
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
  nullable?: true;
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
  enum?: Type extends string | number | boolean
    ? Type[]
    : Type extends Array<infer Element>
      ? Element
      : Type extends object
        ? ObjectValue
        : never;
}

interface CustomOptions<Options extends Dictionary> {
  format?: string;
  visible?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  options?: Options;
  [alt: string]: any;
}
