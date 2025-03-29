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
  | NullSchema<Options, RenderOptions>;

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

export interface NullSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> extends BasicSchema<null, Options, RenderOptions> {
  type: 'null';
  nullable: true;
}

export interface BasicSchema<
  Type,
  Options extends Dictionary,
  RenderOptions extends Dictionary,
> extends CustomOptions<Options, RenderOptions> {
  if?: PartialJsonSchema;
  then?: PartialJsonSchema;
  else?: PartialJsonSchema;
  not?: PartialJsonSchema;
  allOf?: PartialJsonSchema[];
  anyOf?: PartialJsonSchema[];
  oneOf?: PartialJsonSchema[];
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
  label?: string;
  placeholder?: string;
  options?: Options;
  renderOptions?: RenderOptions;
  [alt: string]: any;
}
