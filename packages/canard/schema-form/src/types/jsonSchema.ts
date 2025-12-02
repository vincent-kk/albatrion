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

/** Standard JSON Schema type union (without virtual nodes) */
export type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options>
  | StringSchema<Options>
  | BooleanSchema<Options>
  | ArraySchema<Options>
  | ObjectSchema<Options>
  | NullSchema<Options>
  | RefSchema;

/** JSON Schema type union including virtual nodes */
export type JsonSchemaWithVirtual<Options extends Dictionary = object> =
  | NumberSchema<Options>
  | StringSchema<Options>
  | BooleanSchema<Options>
  | ArraySchema<Options>
  | ObjectSchema<Options>
  | NullSchema<Options>
  | VirtualSchema<Options>;

/** JSON Schema type union with virtual nodes and $ref support */
export type JsonSchemaWithRef<Options extends Dictionary = object> =
  | JsonSchemaWithVirtual<Options>
  | RefSchema;

/** Partial version of JSON Schema with virtual nodes */
export type PartialJsonSchema<Options extends Dictionary = object> = Partial<
  JsonSchemaWithVirtual<Options>
>;

/** Number type schema (numeric or integer values) */
export type NumberSchema<Options extends Dictionary = object> =
  | NonNullableNumberSchema<Options>
  | NullableNumberSchema<Options>;
/** Non-nullable number schema */
export type NonNullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNonNullableNumberSchema<Options, JsonSchema<Options>>;
/** Nullable number schema (type: ['number', 'null']) */
export type NullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNullableNumberSchema<Options, JsonSchema<Options>>;

/** String type schema */
export type StringSchema<Options extends Dictionary = object> =
  | NonNullableStringSchema<Options>
  | NullableStringSchema<Options>;
/** Non-nullable string schema with optional trim support */
export type NonNullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNonNullableStringSchema<Options, JsonSchema<Options>> & {
      options?: { trim?: boolean };
    };
/** Nullable string schema (type: ['string', 'null']) with optional trim support */
export type NullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNullableStringSchema<Options, JsonSchema<Options>> & {
      options?: { trim?: boolean };
    };

/** Boolean type schema */
export type BooleanSchema<Options extends Dictionary = object> =
  | NonNullableBooleanSchema<Options>
  | NullableBooleanSchema<Options>;
/** Non-nullable boolean schema */
export type NonNullableBooleanSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNonNullableBooleanSchema<Options, JsonSchema<Options>>;
/** Nullable boolean schema (type: ['boolean', 'null']) */
export type NullableBooleanSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNullableBooleanSchema<Options, JsonSchema<Options>>;

/** Array type schema */
export type ArraySchema<Options extends Dictionary = object> =
  | NonNullableArraySchema<Options>
  | NullableArraySchema<Options>;
/** Non-nullable array schema */
export type NonNullableArraySchema<Options extends Dictionary = object> =
  BasicSchema & BaseNonNullableArraySchema<Options, JsonSchema<Options>>;
/** Nullable array schema (type: ['array', 'null']) */
export type NullableArraySchema<Options extends Dictionary = object> =
  BasicSchema & BaseNullableArraySchema<Options, JsonSchema<Options>>;

/** Object type schema */
export type ObjectSchema<Options extends Dictionary = object> =
  | NonNullableObjectSchema<Options>
  | NullableObjectSchema<Options>;
/** Non-nullable object schema with optional property ordering and virtual properties */
export type NonNullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNonNullableObjectSchema<Options, JsonSchema<Options>> & {
      /** Property keys order for rendering */
      propertyKeys?: string[];
      /** Virtual property definitions for conditional fields */
      virtual?: VirtualSchemaProperties;
    };
/** Nullable object schema (type: ['object', 'null']) with optional property ordering and virtual properties */
export type NullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNullableObjectSchema<Options, JsonSchema<Options>> & {
      /** Property keys order for rendering */
      propertyKeys?: string[];
      /** Virtual property definitions for conditional fields */
      virtual?: VirtualSchemaProperties;
    };
/** Virtual schema property definitions (cannot be nullable) */
type VirtualSchemaProperties = Dictionary<
  { fields: string[]; nullable?: never } & BasicSchema
>;

/** Virtual node schema for non-schema computed fields */
export type VirtualSchema<Options extends Dictionary = object> = {
  type: 'virtual';
  /** Dependent field paths for reactivity */
  fields?: string[];
  nullable?: never;
} & BasicSchema &
  BaseBasicSchema<VirtualNodeValue, Options, JsonSchema<Options>>;

/** Null type schema */
export type NullSchema<Options extends Dictionary = object> = BasicSchema &
  BaseNullSchema<Options, JsonSchema<Options>>;

/** Base schema properties for all types */
export type BasicSchema = {
  /** Custom React component for input rendering */
  FormTypeInput?: ComponentType<UnknownFormTypeInputProps> | null;
  /** Props passed to FormTypeInput component */
  FormTypeInputProps?: Dictionary;
  /** Props passed to FormTypeRenderer component */
  FormTypeRendererProps?: Dictionary;
  /** Form type identifier for component selection */
  formType?: string;
  /** Whether node is a terminal (leaf) node */
  terminal?: boolean;
  /** Inline CSS styles for the field */
  style?: CSSProperties;
  /** Field label (React node) */
  label?: ReactNode;
  /** Placeholder text for input fields */
  placeholder?: string;
  /** Custom error messages per validation rule */
  errorMessages?: {
    [key: string]: string | Dictionary<string> | undefined;
    default?: string | Dictionary<string>;
  };
  /** Field options and configurations */
  options?: {
    /** Display name aliases for enum values */
    alias?: Dictionary<ReactNode>;
    /** Omit empty values from form data */
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
  /** Computed properties with JSONPointer expressions */
  computed?: {
    /** Conditional rendering expression */
    if?: boolean | string;
    /** Watched field paths for reactivity */
    watch?: string | string[];
    /** Active state expression */
    active?: boolean | string;
    /** Visibility state expression */
    visible?: boolean | string;
    /** Read-only state expression */
    readOnly?: boolean | string;
    /** Disabled state expression */
    disabled?: boolean | string;
  };
  [alt: string]: any;
};
