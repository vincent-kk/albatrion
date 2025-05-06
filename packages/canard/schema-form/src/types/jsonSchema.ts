import type { CSSProperties, ComponentType, ReactNode } from 'react';

import type {
  ArraySchema as BaseArraySchema,
  BasicSchema as BaseBasicSchema,
  BooleanSchema as BaseBooleanSchema,
  NullSchema as BaseNullSchema,
  NumberSchema as BaseNumberSchema,
  ObjectSchema as BaseObjectSchema,
  StringSchema as BaseStringSchema,
  RefSchema,
} from '@winglet/json-schema';

import type { Dictionary } from '@aileron/declare';

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
export type InferJsonSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NumberSchema<Options>
  : Value extends StringValue
    ? StringSchema<Options>
    : Value extends BooleanValue
      ? BooleanSchema<Options>
      : Value extends ArrayValue
        ? ArraySchema<Options>
        : Value extends ObjectValue
          ? ObjectSchema<Options>
          : Value extends null
            ? NullSchema<Options>
            : JsonSchemaWithVirtual<Options>;

export type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options>
  | StringSchema<Options>
  | BooleanSchema<Options>
  | ArraySchema<Options>
  | ObjectSchema<Options>
  | NullSchema<Options>
  | RefSchema;

export type JsonSchemaWithVirtual<Options extends Dictionary = object> =
  | JsonSchema<Options>
  | VirtualSchema<Options>;

export type NumberSchema<Options extends Dictionary = object> =
  BasicSchema<NumberValue> & BaseNumberSchema<Options, JsonSchema<Options>>;

export type StringSchema<Options extends Dictionary = object> =
  BasicSchema<StringValue> & BaseStringSchema<Options, JsonSchema<Options>>;

export type BooleanSchema<Options extends Dictionary = object> =
  BasicSchema<BooleanValue> & BaseBooleanSchema<Options, JsonSchema<Options>>;

export type ArraySchema<Options extends Dictionary = object> =
  BasicSchema<ArrayValue> & BaseArraySchema<Options, JsonSchema<Options>>;

export type ObjectSchema<Options extends Dictionary = object> =
  BasicSchema<ObjectValue> & BaseObjectSchema<Options, JsonSchema<Options>>;

export type VirtualSchema<Options extends Dictionary = object> = {
  type: 'virtual';
  fields?: string[];
} & BasicSchema<VirtualNodeValue> &
  BaseBasicSchema<VirtualNodeValue, Options, JsonSchema<Options>>;

export type NullSchema<Options extends Dictionary = object> =
  BasicSchema<NullValue> & BaseNullSchema<Options, JsonSchema<Options>>;

type BasicSchema<Type> = {
  FormType?: ComponentType<UnknownFormTypeInputProps>;
  style?: CSSProperties;
  label?: ReactNode;
  options?: {
    watch?: string | string[];
    alias?: Dictionary<ReactNode>;
    formatter?: Formatter<Type>;
    parser?: Parser<Type>;
    [alt: string]: any;
  };
  computed?: {
    visible?: boolean | string;
    readOnly?: boolean | string;
    disabled?: boolean | string;
  };
  [alt: string]: any;
};
