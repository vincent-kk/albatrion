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
  NumberValue,
  ObjectValue,
  StringValue,
  VirtualNodeValue,
} from './value';

export const isVirtualSchema = (schema: {
  type: string;
}): schema is VirtualSchema => schema.type === 'virtual';

/** Infer appropriate Schema based on input value */
export type InferJsonSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
> = Value extends NumberValue | undefined
  ? NumberSchema<Options>
  : Value extends StringValue | undefined
    ? StringSchema<Options>
    : Value extends BooleanValue | undefined
      ? BooleanSchema<Options>
      : Value extends ArrayValue | undefined
        ? ArraySchema<Options>
        : Value extends ObjectValue | undefined
          ? ObjectSchema<Options>
          : Value extends null | undefined
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
  | NumberSchema<Options>
  | StringSchema<Options>
  | BooleanSchema<Options>
  | ArraySchema<Options>
  | ObjectSchema<Options>
  | NullSchema<Options>
  | VirtualSchema<Options>;

export type JsonSchemaWithRef<Options extends Dictionary = object> =
  | JsonSchemaWithVirtual<Options>
  | RefSchema;

export type NumberSchema<Options extends Dictionary = object> = BasicSchema &
  BaseNumberSchema<Options, JsonSchema<Options>>;

export type StringSchema<Options extends Dictionary = object> = BasicSchema &
  BaseStringSchema<Options, JsonSchema<Options>> & {
    options?: {
      trim?: boolean;
    };
  };

export type BooleanSchema<Options extends Dictionary = object> = BasicSchema &
  BaseBooleanSchema<Options, JsonSchema<Options>>;

export type ArraySchema<Options extends Dictionary = object> = BasicSchema &
  BaseArraySchema<Options, JsonSchema<Options>>;

export type ObjectSchema<Options extends Dictionary = object> = BasicSchema &
  BaseObjectSchema<Options, JsonSchema<Options>> & {
    propertyKeys?: string[];
    virtual?: Dictionary<{ fields: string[] } & BasicSchema>;
  };

export type VirtualSchema<Options extends Dictionary = object> = {
  type: 'virtual';
  fields?: string[];
} & BasicSchema &
  BaseBasicSchema<VirtualNodeValue, Options, JsonSchema<Options>>;

export type NullSchema<Options extends Dictionary = object> = BasicSchema &
  BaseNullSchema<Options, JsonSchema<Options>>;

export type BasicSchema = {
  FormType?: ComponentType<UnknownFormTypeInputProps>;
  formType?: string;
  terminal?: boolean;
  style?: CSSProperties;
  label?: ReactNode;
  placeholder?: string;
  errorMessages?: {
    [key: string]: string | Dictionary<string> | undefined;
    default?: string | Dictionary<string>;
  };
  options?: {
    alias?: Dictionary<ReactNode>;
    omitEmpty?: boolean;
    [alt: string]: any;
  };
  /** Alias for computed.if */
  '&if'?: boolean | string;
  /** Alias for computed.watch */
  '&watch'?: string | string[];
  /** Alias for computed.visible */
  '&visible'?: boolean | string;
  /** Alias for computed.readOnly */
  '&readOnly'?: boolean | string;
  /** Alias for computed.disabled */
  '&disabled'?: boolean | string;
  computed?: {
    if?: boolean | string;
    watch?: string | string[];
    visible?: boolean | string;
    readOnly?: boolean | string;
    disabled?: boolean | string;
  };
  [alt: string]: any;
};
