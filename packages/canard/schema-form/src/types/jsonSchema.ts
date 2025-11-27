import type { CSSProperties, ComponentType, ReactNode } from 'react';

import type {
  ArrayNullableSchema as BaseArrayNullableSchema,
  ArraySchema as BaseArraySchema,
  BasicSchema as BaseBasicSchema,
  BooleanNullableSchema as BaseBooleanNullableSchema,
  BooleanSchema as BaseBooleanSchema,
  NullSchema as BaseNullSchema,
  NumberNullableSchema as BaseNumberNullableSchema,
  NumberSchema as BaseNumberSchema,
  ObjectNullableSchema as BaseObjectNullableSchema,
  ObjectSchema as BaseObjectSchema,
  StringNullableSchema as BaseStringNullableSchema,
  StringSchema as BaseStringSchema,
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
  ? NumberSchema<Options>
  : Value extends StringValue
    ? StringSchema<Options>
    : Value extends BooleanValue
      ? BooleanSchema<Options>
      : Value extends ArrayValue
        ? ArraySchema<Options>
        : Value extends ObjectValue
          ? ObjectSchema<Options>
          : Value extends VirtualNodeValue
            ? VirtualSchema<Options>
            : JsonSchemaWithVirtual<Options>;

/** Schema inference for nullable values (excluding VirtualSchema - cannot be nullable) */
type InferNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NumberNullableSchema<Options>
  : Value extends StringValue
    ? StringNullableSchema<Options>
    : Value extends BooleanValue
      ? BooleanNullableSchema<Options>
      : Value extends ArrayValue
        ? ArrayNullableSchema<Options>
        : Value extends ObjectValue
          ? ObjectNullableSchema<Options>
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
  | NumberNullableSchema<Options>
  | StringSchema<Options>
  | StringNullableSchema<Options>
  | BooleanSchema<Options>
  | BooleanNullableSchema<Options>
  | ArraySchema<Options>
  | ArrayNullableSchema<Options>
  | ObjectSchema<Options>
  | ObjectNullableSchema<Options>
  | NullSchema<Options>
  | RefSchema;

export type JsonSchemaWithVirtual<Options extends Dictionary = object> =
  | NumberSchema<Options>
  | NumberNullableSchema<Options>
  | StringSchema<Options>
  | StringNullableSchema<Options>
  | BooleanSchema<Options>
  | BooleanNullableSchema<Options>
  | ArraySchema<Options>
  | ArrayNullableSchema<Options>
  | ObjectSchema<Options>
  | ObjectNullableSchema<Options>
  | NullSchema<Options>
  | VirtualSchema<Options>;

export type JsonSchemaWithRef<Options extends Dictionary = object> =
  | JsonSchemaWithVirtual<Options>
  | RefSchema;

export type PartialJsonSchema<Options extends Dictionary = object> = Partial<
  JsonSchemaWithVirtual<Options>
>;

export type NumberSchema<Options extends Dictionary = object> = BasicSchema &
  BaseNumberSchema<Options, JsonSchema<Options>>;

export type NumberNullableSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNumberNullableSchema<Options, JsonSchema<Options>>;

export type StringSchema<Options extends Dictionary = object> = BasicSchema &
  BaseStringSchema<Options, JsonSchema<Options>> & {
    options?: { trim?: boolean };
  };

export type StringNullableSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseStringNullableSchema<Options, JsonSchema<Options>> & {
      options?: { trim?: boolean };
    };

export type BooleanSchema<Options extends Dictionary = object> = BasicSchema &
  BaseBooleanSchema<Options, JsonSchema<Options>>;
export type BooleanNullableSchema<Options extends Dictionary = object> =
  BasicSchema & BaseBooleanNullableSchema<Options, JsonSchema<Options>>;

export type ArraySchema<Options extends Dictionary = object> = BasicSchema &
  BaseArraySchema<Options, JsonSchema<Options>>;

export type ArrayNullableSchema<Options extends Dictionary = object> =
  BasicSchema & BaseArrayNullableSchema<Options, JsonSchema<Options>>;

export type ObjectSchema<Options extends Dictionary = object> = BasicSchema &
  BaseObjectSchema<Options, JsonSchema<Options>> & {
    propertyKeys?: string[];
    virtual?: Dictionary<{ fields: string[]; nullable?: never } & BasicSchema>;
  };

export type ObjectNullableSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseObjectNullableSchema<Options, JsonSchema<Options>> & {
      propertyKeys?: string[];
      virtual?: Dictionary<
        { fields: string[]; nullable?: never } & BasicSchema
      >;
    };

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
