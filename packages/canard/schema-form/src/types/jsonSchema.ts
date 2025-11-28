import type { CSSProperties, ComponentType, ReactNode } from 'react';

import type {
  BasicSchema as BaseBasicSchema,
  NonNullableArraySchema as BaseNonNullableArraySchema,
  NonNullableBooleanSchema as BaseNonNullableBooleanSchema,
  NonNullableNumberSchema as BaseNonNullableNumberSchema,
  NonNullableObjectSchema as BaseNonNullableObjectSchema,
  NonNullableStringSchema as BaseNonNullableStringSchema,
  NullSchema as BaseNullSchema,
  NullableArraySchema as BaseNullableArraySchema,
  NullableBooleanSchema as BaseNullableBooleanSchema,
  NullableNumberSchema as BaseNullableNumberSchema,
  NullableObjectSchema as BaseNullableObjectSchema,
  NullableStringSchema as BaseNullableStringSchema,
  RefSchema,
} from '@winglet/json-schema';

import type { Dictionary, IsNullable } from '@aileron/declare';

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

export type JsonSchemaType = Extract<JsonSchemaWithVirtual['type'], string>;

/** Schema inference for non-nullable values */
type InferNonNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NonNullableNumberSchema<Options>
  : Value extends StringValue
    ? NonNullableStringSchema<Options>
    : Value extends BooleanValue
      ? NonNullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? NonNullableArraySchema<Options>
        : Value extends ObjectValue
          ? NonNullableObjectSchema<Options>
          : Value extends VirtualNodeValue
            ? VirtualSchema<Options>
            : JsonSchemaWithVirtual<Options>;

/** Schema inference for nullable values (excluding VirtualSchema - cannot be nullable) */
type InferNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NullableNumberSchema<Options>
  : Value extends StringValue
    ? NullableStringSchema<Options>
    : Value extends BooleanValue
      ? NullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? NullableArraySchema<Options>
        : Value extends ObjectValue
          ? NullableObjectSchema<Options>
          : NullSchema<Options>;

/**
 * Infers the appropriate Schema type based on the input value.
 * - For nullable types (T | null), returns the corresponding Nullable schema
 * - For non-nullable types, returns the standard schema
 * - For pure null type, returns NullSchema
 */
export type InferJsonSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
> = [Value] extends [null]
  ? NullSchema<Options>
  : IsNullable<Value> extends true
    ? InferNullableSchema<Exclude<Value, null>, Options>
    : InferNonNullableSchema<Value, Options>;

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

export type PartialJsonSchema<Options extends Dictionary = object> = Partial<
  JsonSchemaWithVirtual<Options>
>;

export type NumberSchema<Options extends Dictionary = object> =
  | NonNullableNumberSchema<Options>
  | NullableNumberSchema<Options>;
export type NonNullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNonNullableNumberSchema<Options, JsonSchema<Options>>;
export type NullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNullableNumberSchema<Options, JsonSchema<Options>>;

export type StringSchema<Options extends Dictionary = object> =
  | NonNullableStringSchema<Options>
  | NullableStringSchema<Options>;
export type NonNullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNonNullableStringSchema<Options, JsonSchema<Options>> & {
      options?: { trim?: boolean };
    };
export type NullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNullableStringSchema<Options, JsonSchema<Options>> & {
      options?: { trim?: boolean };
    };

export type BooleanSchema<Options extends Dictionary = object> =
  | NonNullableBooleanSchema<Options>
  | NullableBooleanSchema<Options>;
export type NonNullableBooleanSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNonNullableBooleanSchema<Options, JsonSchema<Options>>;
export type NullableBooleanSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNullableBooleanSchema<Options, JsonSchema<Options>>;

export type ArraySchema<Options extends Dictionary = object> =
  | NonNullableArraySchema<Options>
  | NullableArraySchema<Options>;
export type NonNullableArraySchema<Options extends Dictionary = object> =
  BasicSchema & BaseNonNullableArraySchema<Options, JsonSchema<Options>>;
export type NullableArraySchema<Options extends Dictionary = object> =
  BasicSchema & BaseNullableArraySchema<Options, JsonSchema<Options>>;

export type ObjectSchema<Options extends Dictionary = object> =
  | NonNullableObjectSchema<Options>
  | NullableObjectSchema<Options>;
export type NonNullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNonNullableObjectSchema<Options, JsonSchema<Options>> & {
      propertyKeys?: string[];
      virtual?: VirtualSchemaProperties;
    };
export type NullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNullableObjectSchema<Options, JsonSchema<Options>> & {
      propertyKeys?: string[];
      virtual?: VirtualSchemaProperties;
    };
type VirtualSchemaProperties = Dictionary<
  { fields: string[]; nullable?: never } & BasicSchema
>;

export type VirtualSchema<Options extends Dictionary = object> = {
  type: 'virtual';
  fields?: string[];
  nullable?: never;
} & BasicSchema &
  BaseBasicSchema<VirtualNodeValue, Options, JsonSchema<Options>>;

export type NullSchema<Options extends Dictionary = object> = BasicSchema &
  BaseNullSchema<Options, JsonSchema<Options>>;

export type BasicSchema = {
  FormTypeInput?: ComponentType<UnknownFormTypeInputProps>;
  FormTypeInputProps?: Dictionary;
  FormTypeRendererProps?: Dictionary;
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
  /** Alias for computed.active */
  '&active'?: boolean | string;
  /** Alias for computed.visible */
  '&visible'?: boolean | string;
  /** Alias for computed.readOnly */
  '&readOnly'?: boolean | string;
  /** Alias for computed.disabled */
  '&disabled'?: boolean | string;
  computed?: {
    if?: boolean | string;
    watch?: string | string[];
    active?: boolean | string;
    visible?: boolean | string;
    readOnly?: boolean | string;
    disabled?: boolean | string;
  };
  [alt: string]: any;
};
