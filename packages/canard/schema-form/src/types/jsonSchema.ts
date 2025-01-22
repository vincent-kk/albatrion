import type { ComponentType, ReactNode } from 'react';

import type { Dictionary } from '@aileron/types';

import type { UnknownFormTypeInputProps } from './formTypeInput';
import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  Formatter,
  NumberValue,
  ObjectValue,
  Parser,
  StringValue,
  VirtualNodeValue,
} from './value';

export enum JSONPath {
  /** Root Node */
  Root = '$',
  /** Current Node */
  Current = '@',
  /** Child Node */
  Child = '.',
  /** Filter Condition */
  Filter = '#',
}

export const enum JSONPointer {
  Root = '',
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

export const isNullSchema = (schema: JsonSchema): schema is NullSchema =>
  schema.type === 'null';

// REF: https://github.com/ajv-validator/ajv/blob/master/lib/types/json-schema.ts

/** 입력된 값을 기반으로 적절한 Schema를 추론 */
export type InferJsonSchemaType<
  V extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = V extends NumberValue
  ? NumberSchema<Options, RenderOptions>
  : V extends StringValue
    ? StringSchema<Options, RenderOptions>
    : V extends BooleanValue
      ? BooleanSchema<Options, RenderOptions>
      : V extends ArrayValue
        ? ArraySchema<Options, RenderOptions>
        : V extends ObjectValue
          ? ObjectSchema<Options, RenderOptions>
          : V extends null
            ? NullSchema<Options, RenderOptions>
            : JsonSchema<Options, RenderOptions>;

export type JsonSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> =
  | NumberSchema<Options, RenderOptions>
  | StringSchema<Options, RenderOptions>
  | BooleanSchema<Options, RenderOptions>
  | ArraySchema<Options, RenderOptions>
  | ObjectSchema<Options, RenderOptions>
  | NullSchema<Options, RenderOptions>
  | VirtualSchema<Options, RenderOptions>;

type PartialJsonSchema = Partial<JsonSchema>;

export interface NumberSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> extends BasicSchema<NumberValue, Options, RenderOptions> {
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
  RenderOptions extends Dictionary = object,
> extends BasicSchema<StringValue, Options, RenderOptions> {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface BooleanSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> extends BasicSchema<BooleanValue, Options, RenderOptions> {
  type: 'boolean';
}

export interface ArraySchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> extends BasicSchema<ArrayValue, Options, RenderOptions> {
  type: 'array';
  items: JsonSchema<Options, RenderOptions>;
  contains?: PartialJsonSchema;
  minItems?: number;
  maxItems?: number;
  minContains?: number;
  maxContains?: number;
  uniqueItems?: true;
  additionalItems?: never;
}

export interface ObjectSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> extends BasicSchema<ObjectValue, Options, RenderOptions> {
  type: 'object';
  additionalProperties?: boolean | JsonSchema<Options, RenderOptions>;
  unevaluatedProperties?: boolean | JsonSchema<Options, RenderOptions>;
  properties?: Dictionary<JsonSchema<Options, RenderOptions>>;
  patternProperties?: Dictionary<JsonSchema<Options, RenderOptions>>;
  propertyNames?: Omit<StringSchema<Options, RenderOptions>, 'type'> & {
    type?: 'string';
  };
  dependencies?: Dictionary<PartialJsonSchema | string[]>;
  dependentRequired?: Dictionary<string[]>;
  dependentSchemas?: Dictionary<PartialJsonSchema>;
  minProperties?: number;
  maxProperties?: number;
  required?: string[];
  virtual?: Dictionary<{
    formType?: string;
    fields: string[];
  }>;
}

export interface VirtualSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> extends BasicSchema<VirtualNodeValue, Options, RenderOptions> {
  type: 'virtual';
  fields?: string[];
}

export interface NullSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> extends BasicSchema<null, Options, RenderOptions> {
  type: 'null';
  nullable: true;
}

interface BasicSchema<
  T,
  Options extends Dictionary,
  RenderOptions extends Dictionary,
> extends CustomOptions<T, Options, RenderOptions> {
  if?: PartialJsonSchema;
  then?: PartialJsonSchema;
  else?: PartialJsonSchema;
  not?: PartialJsonSchema;
  allOf?: PartialJsonSchema[];
  anyOf?: PartialJsonSchema[];
  oneOf?: PartialJsonSchema[];
  nullable?: boolean;
  const?: T;
  default?: T;
  enum?: T extends string | number | boolean
    ? T[]
    : T extends Array<infer E>
      ? E
      : T extends object
        ? ObjectValue
        : never;
}

interface CustomOptions<
  T,
  Options extends Dictionary,
  RenderOptions extends Dictionary,
> {
  formType?: string | ComponentType<UnknownFormTypeInputProps>;
  label?: ReactNode;
  format?: string;
  visible?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: {
    watch?: string | string[];
    alias?: Dictionary<ReactNode>;
    lazy?: boolean;
    formatter?: Formatter<T>;
    parser?: Parser<T>;
    [alt: string]: any;
  } & Options;
  renderOptions?: {
    visible?: boolean | string;
    readOnly?: boolean | string;
    disabled?: boolean | string;
    [alt: string]: any;
  } & RenderOptions;
  [alt: string]: any;
}
