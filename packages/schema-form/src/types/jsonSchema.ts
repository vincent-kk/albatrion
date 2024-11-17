import type { ReactNode } from 'react';

import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  NumberValue,
  ObjectValue,
  StringValue,
  VirtualNodeValue,
} from './value';

export const enum JSONPath {
  Root = '$',
  Current = '@',
  Child = '/',
}

export const isArraySchema = (schema: JsonSchema): schema is ArraySchema =>
  schema.type === 'array';

export const isNumberSchema = (schema: JsonSchema): schema is NumberSchema =>
  schema.type === 'number';

export const isObjectSchema = (schema: JsonSchema): schema is ObjectSchema =>
  schema.type === 'object';

export const isStringSchema = (schema: JsonSchema): schema is StringSchema =>
  schema.type === 'string';

export const isVirtualSchema = (schema: JsonSchema): schema is VirtualSchema =>
  schema.type === 'virtual';

export const isBooleanSchema = (schema: JsonSchema): schema is BooleanSchema =>
  schema.type === 'boolean';

// REF: https://github.com/ajv-validator/ajv/blob/master/lib/types/json-schema.ts

/** 입력된 값을 기반으로 적절한 Schema를 추론 */
export type InferJsonSchemaType<V extends AllowedValue | unknown = any> =
  V extends NumberValue
    ? NumberSchema
    : V extends StringValue
      ? StringSchema
      : V extends BooleanValue
        ? BooleanSchema
        : V extends ArrayValue
          ? ArraySchema
          : V extends ObjectValue
            ? ObjectSchema
            : V extends null
              ? NullSchema
              : JsonSchema;

export type JsonSchema =
  | NumberSchema
  | StringSchema
  | BooleanSchema
  | ArraySchema
  | ObjectSchema
  | NullSchema
  | VirtualSchema;

type PartialJsonSchema = Partial<JsonSchema>;

export interface NumberSchema extends BasicSchema<NumberValue> {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  format?: string;
}

export interface StringSchema extends BasicSchema<StringValue> {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface BooleanSchema extends BasicSchema<BooleanValue> {
  type: 'boolean';
}

export interface ArraySchema extends BasicSchema<ArrayValue> {
  type: 'array';
  items: JsonSchema;
  contains?: PartialJsonSchema;
  minItems?: number;
  maxItems?: number;
  minContains?: number;
  maxContains?: number;
  uniqueItems?: true;
  additionalItems?: never;
}

export interface ObjectSchema extends BasicSchema<ObjectValue> {
  type: 'object';
  additionalProperties?: boolean | JsonSchema;
  unevaluatedProperties?: boolean | JsonSchema;
  properties?: Record<string, JsonSchema>;
  patternProperties?: Record<string, JsonSchema>;
  propertyNames?: Omit<StringSchema, 'type'> & { type?: 'string' };
  dependencies?: Record<string, PartialJsonSchema | string[]>;
  dependentRequired?: Record<string, string[]>;
  dependentSchemas?: Record<string, PartialJsonSchema>;
  minProperties?: number;
  maxProperties?: number;
  required?: string[];
  virtual?: Record<
    string,
    {
      formType?: string;
      fields: string[];
    }
  >;
}

export interface NullSchema extends BasicSchema<null> {
  type: 'null';
  nullable: true;
}

export interface VirtualSchema extends BasicSchema<VirtualNodeValue> {
  type: 'virtual';
  fields?: string[];
}

interface BasicSchema<T> extends CustomOptions {
  if?: PartialJsonSchema;
  then?: PartialJsonSchema;
  else?: PartialJsonSchema;
  not?: PartialJsonSchema;
  allOf?: PartialJsonSchema[];
  anyOf?: PartialJsonSchema[];
  oneOf?: PartialJsonSchema[];
  nullable?: boolean;
  const?: T;
  enum?: T[];
  default?: T;
}

interface CustomOptions {
  ui?: {
    show?: string | boolean;
  };
  options?: {
    lazy?: boolean;
    watch?: string | string[];
    alias?: Record<string, ReactNode>;
    [key: string]: any;
  };
  formType?: string;
  format?: string;
  [key: string]: any;
}
