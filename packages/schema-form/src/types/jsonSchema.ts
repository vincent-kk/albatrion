import type { ErrorObject } from 'ajv';
import type { ReactNode } from 'react';

export const enum JSONPath {
  Root = '$',
  Current = '@',
  Child = '.',
}

export type AllowedValue =
  | number
  | string
  | boolean
  | any[]
  | Record<string, any>
  | null;

// REF: https://github.com/ajv-validator/ajv/blob/master/lib/types/json-schema.ts

/** 입력된 값을 기반으로 적절한 Schema를 추론 */
export type ExpectJsonSchema<V extends AllowedValue | unknown = any> =
  V extends number
    ? NumberSchema
    : V extends string
      ? StringSchema
      : V extends boolean
        ? BooleanSchema
        : V extends any[]
          ? ArraySchema
          : V extends Record<string, any>
            ? ObjectSchema
            : V extends null
              ? NullSchema
              : V extends unknown
                ? VirtualSchema
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

export interface NumberSchema extends BasicSchema<number> {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  format?: string;
}

export interface StringSchema extends BasicSchema<string> {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface BooleanSchema extends BasicSchema<boolean> {
  type: 'boolean';
}

export interface ArraySchema extends BasicSchema<any[]> {
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

export interface ObjectSchema extends BasicSchema<Record<string, any>> {
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

export interface VirtualSchema extends BasicSchema<unknown> {
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
  styles?: {
    show?: string | boolean;
  };
  options?: {
    formType?: string;
    format?: string;
    lazy?: boolean;
    watch?: string | string[];
    alias?: Record<string, ReactNode>;
    [key: string]: any;
  };
  formType?: string;
  format?: string;
  [key: string]: any;
}

export interface JsonSchemaError extends ErrorObject {
  key?: number;
  params: ErrorParameters;
  [alt: string]: any;
}

// NOTE: possible ajv error parameters
type ErrorParameters = Partial<{
  ref: string;
  limit: number | string;
  additionalProperty: string;
  property: string;
  missingProperty: string;
  depsCount: number;
  deps: string;
  format: string;
  comparison: string;
  exclusive: boolean;
  multipleOf: number;
  pattern: string;
  type: string;
  keyword: string;
  missingPattern: string;
  propertyName: string;
  failingKeyword: string;
  caseIndex: number;
  allowedValues: any[];
  [alt: string]: any;
}>;
