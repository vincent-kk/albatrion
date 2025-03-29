import type { CSSProperties, ComponentType, ReactNode } from 'react';

import type { BasicSchema as BaseBasicSchema } from '@winglet/json-schema';

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

export const isArraySchema = (
  schema: JsonSchemaWithVirtual,
): schema is ArraySchema => schema.type === 'array';

export const isNumberSchema = (
  schema: JsonSchemaWithVirtual,
): schema is NumberSchema => schema.type === 'number';

export const isObjectSchema = (
  schema: JsonSchemaWithVirtual,
): schema is ObjectSchema => schema.type === 'object';

export const isStringSchema = (
  schema: JsonSchemaWithVirtual,
): schema is StringSchema => schema.type === 'string';

export const isVirtualSchema = (
  schema: JsonSchemaWithVirtual,
): schema is VirtualSchema => schema.type === 'virtual';

export const isBooleanSchema = (
  schema: JsonSchemaWithVirtual,
): schema is BooleanSchema => schema.type === 'boolean';

export const isNullSchema = (
  schema: JsonSchemaWithVirtual,
): schema is NullSchema => schema.type === 'null';

// REF: https://github.com/ajv-validator/ajv/blob/master/lib/types/json-schema.ts

/** 입력된 값을 기반으로 적절한 Schema를 추론 */
export type InferJsonSchemaType<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = Value extends NumberValue
  ? NumberSchema<Options, RenderOptions>
  : Value extends StringValue
    ? StringSchema<Options, RenderOptions>
    : Value extends BooleanValue
      ? BooleanSchema<Options, RenderOptions>
      : Value extends ArrayValue
        ? ArraySchema<Options, RenderOptions>
        : Value extends ObjectValue
          ? ObjectSchema<Options, RenderOptions>
          : Value extends null
            ? NullSchema<Options, RenderOptions>
            : JsonSchemaWithVirtual<Options, RenderOptions>;

export type JsonSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> =
  | NumberSchema<Options, RenderOptions>
  | StringSchema<Options, RenderOptions>
  | BooleanSchema<Options, RenderOptions>
  | ArraySchema<Options, RenderOptions>
  | ObjectSchema<Options, RenderOptions>
  | NullSchema<Options, RenderOptions>;

export type JsonSchemaWithVirtual<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = JsonSchema<Options, RenderOptions> | VirtualSchema<Options, RenderOptions>;

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
  items: JsonSchemaWithVirtual<Options, RenderOptions>;
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
  additionalProperties?:
    | boolean
    | JsonSchemaWithVirtual<Options, RenderOptions>;
  unevaluatedProperties?:
    | boolean
    | JsonSchemaWithVirtual<Options, RenderOptions>;
  properties?: Dictionary<JsonSchemaWithVirtual<Options, RenderOptions>>;
  patternProperties?: Dictionary<JsonSchemaWithVirtual<Options, RenderOptions>>;
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
  Type,
  Options extends Dictionary,
  RenderOptions extends Dictionary,
> extends Omit<BaseBasicSchema<Type, Options, RenderOptions>, 'formType'> {
  if?: PartialJsonSchema;
  then?: PartialJsonSchema;
  else?: PartialJsonSchema;
  not?: PartialJsonSchema;
  allOf?: PartialJsonSchema[];
  anyOf?: PartialJsonSchema[];
  oneOf?: PartialJsonSchema[];
  formType?: string | ComponentType<UnknownFormTypeInputProps>;
  style?: CSSProperties;
  label?: ReactNode;
  options?: {
    watch?: string | string[];
    alias?: Dictionary<ReactNode>;
    lazy?: boolean;
    formatter?: Formatter<Type>;
    parser?: Parser<Type>;
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
