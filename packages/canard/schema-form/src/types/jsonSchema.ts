import type { CSSProperties, ComponentType, ReactNode } from 'react';

import type {
  ArraySchema as BaseArraySchema,
  BasicSchema as BaseBasicSchema,
  BooleanSchema as BaseBooleanSchema,
  NullSchema as BaseNullSchema,
  NumberSchema as BaseNumberSchema,
  ObjectSchema as BaseObjectSchema,
  StringSchema as BaseStringSchema,
} from '@winglet/json-schema';

import type { Dictionary } from '@aileron/types';

import type { UnknownFormTypeInputProps } from './formTypeInput';
import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  Formatter,
  NullValue,
  NumberValue,
  ObjectValue,
  Parser,
  StringValue,
  VirtualNodeValue,
} from './value';

export const isVirtualSchema = (schema: {
  type: string;
}): schema is VirtualSchema => schema.type === 'virtual';

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

export type NumberSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = BasicSchema<NumberValue> &
  BaseNumberSchema<Options, RenderOptions, JsonSchema<Options, RenderOptions>>;

export type StringSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = BasicSchema<StringValue> &
  BaseStringSchema<Options, RenderOptions, JsonSchema<Options, RenderOptions>>;

export type BooleanSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = BasicSchema<BooleanValue> &
  BaseBooleanSchema<Options, RenderOptions, JsonSchema<Options, RenderOptions>>;

export type ArraySchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = BasicSchema<ArrayValue> &
  BaseArraySchema<Options, RenderOptions, JsonSchema<Options, RenderOptions>>;

export type ObjectSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = BasicSchema<ObjectValue> &
  BaseObjectSchema<Options, RenderOptions, JsonSchema<Options, RenderOptions>>;

export type VirtualSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = {
  type: 'virtual';
  fields?: string[];
} & BasicSchema<VirtualNodeValue> &
  BaseBasicSchema<
    VirtualNodeValue,
    Options,
    RenderOptions,
    JsonSchema<Options, RenderOptions>
  >;

export type NullSchema<
  Options extends Dictionary = object,
  RenderOptions extends Dictionary = object,
> = BasicSchema<NullValue> &
  BaseNullSchema<Options, RenderOptions, JsonSchema<Options, RenderOptions>>;

type BasicSchema<Type> = {
  FormType?: ComponentType<UnknownFormTypeInputProps>;
  style?: CSSProperties;
  label?: ReactNode;
  options?: {
    watch?: string | string[];
    alias?: Dictionary<ReactNode>;
    lazy?: boolean;
    formatter?: Formatter<Type>;
    parser?: Parser<Type>;
    [alt: string]: any;
  };
  renderOptions?: {
    visible?: boolean | string;
    readOnly?: boolean | string;
    disabled?: boolean | string;
    [alt: string]: any;
  };
  [alt: string]: any;
};
