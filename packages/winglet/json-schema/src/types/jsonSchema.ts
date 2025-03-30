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

type MinimalSchema = { type?: JsonSchema['type']; [key: string]: any };

type UnknownSchema = { type?: string; [key: string]: any };

/** 입력된 값을 기반으로 적절한 Schema를 추론 */
export type InferJsonSchemaType<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
  PartialSchema extends UnknownSchema = MinimalSchema,
> = Value extends NumberValue
  ? NumberSchema<Options, RenderOptions, PartialSchema>
  : Value extends StringValue
    ? StringSchema<Options, RenderOptions, PartialSchema>
    : Value extends BooleanValue
      ? BooleanSchema<Options, RenderOptions, PartialSchema>
      : Value extends ArrayValue
        ? ArraySchema<Options, RenderOptions, PartialSchema>
        : Value extends ObjectValue
          ? ObjectSchema<Options, RenderOptions, PartialSchema>
          : Value extends null
            ? NullSchema<Options, RenderOptions, PartialSchema>
            : JsonSchema<Options, RenderOptions, PartialSchema>;

export type JsonSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
  PartialSchema extends UnknownSchema = MinimalSchema,
> =
  | NumberSchema<Options, RenderOptions, PartialSchema>
  | StringSchema<Options, RenderOptions, PartialSchema>
  | BooleanSchema<Options, RenderOptions, PartialSchema>
  | ArraySchema<Options, RenderOptions, PartialSchema>
  | ObjectSchema<Options, RenderOptions, PartialSchema>
  | NullSchema<Options, RenderOptions, PartialSchema>;

export interface NumberSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
  PartialSchema extends UnknownSchema = MinimalSchema,
> extends BasicSchema<NumberValue, Options, RenderOptions, PartialSchema> {
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
  PartialSchema extends UnknownSchema = MinimalSchema,
> extends BasicSchema<StringValue, Options, RenderOptions, PartialSchema> {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface BooleanSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
  PartialSchema extends UnknownSchema = MinimalSchema,
> extends BasicSchema<BooleanValue, Options, RenderOptions, PartialSchema> {
  type: 'boolean';
}

export interface ArraySchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
  PartialSchema extends UnknownSchema = MinimalSchema,
> extends BasicSchema<ArrayValue, Options, RenderOptions, PartialSchema> {
  type: 'array';
  items: JsonSchema<Options, RenderOptions, PartialSchema>;
  contains?: PartialSchema;
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
  PartialSchema extends UnknownSchema = MinimalSchema,
> extends BasicSchema<ObjectValue, Options, RenderOptions, PartialSchema> {
  type: 'object';
  additionalProperties?: boolean | JsonSchema<Options, RenderOptions>;
  unevaluatedProperties?: boolean | JsonSchema<Options, RenderOptions>;
  properties?: Dictionary<JsonSchema<Options, RenderOptions>>;
  patternProperties?: Dictionary<JsonSchema<Options, RenderOptions>>;
  propertyNames?: Omit<StringSchema<Options, RenderOptions>, 'type'> & {
    type?: 'string';
  };
  dependencies?: Dictionary<PartialSchema | string[]>;
  dependentRequired?: Dictionary<string[]>;
  dependentSchemas?: Dictionary<PartialSchema>;
  minProperties?: number;
  maxProperties?: number;
  required?: string[];
  virtual?: Dictionary<{
    formType?: string;
    fields: string[];
  }>;
}

export interface NullSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
  PartialSchema extends UnknownSchema = MinimalSchema,
> extends BasicSchema<null, Options, RenderOptions, PartialSchema> {
  type: 'null';
  nullable: true;
}

export interface BasicSchema<
  Type,
  Options extends Dictionary,
  RenderOptions extends Dictionary,
  PartialSchema extends UnknownSchema = MinimalSchema,
> extends CustomOptions<Options, RenderOptions> {
  if?: PartialSchema;
  then?: PartialSchema;
  else?: PartialSchema;
  not?: PartialSchema;
  allOf?: PartialSchema[];
  anyOf?: PartialSchema[];
  oneOf?: PartialSchema[];
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

interface CustomOptions<
  Options extends Dictionary,
  RenderOptions extends Dictionary,
> {
  formType?: string;
  format?: string;
  visible?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: Options;
  renderOptions?: RenderOptions;
  [alt: string]: any;
}
