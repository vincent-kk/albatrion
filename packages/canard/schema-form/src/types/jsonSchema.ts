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

import type { SchemaControls } from '../core/types/controls';
import type { FieldInputProps } from './fieldInput';
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

export type JSONSchemaType = Extract<JSONSchemaWithVirtual['type'], string>;

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
            : JSONSchemaWithVirtual<Options>;

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

/** Collects each admitted JSON kind once, without distributing the resulting schema. */
type InferredKinds<Value> = readonly [
  ...([Extract<Value, string>] extends [never] ? [] : ['string']),
  ...([Extract<Value, number>] extends [never] ? [] : ['number']),
  ...([Extract<Value, boolean>] extends [never] ? [] : ['boolean']),
  ...([Extract<Value, ArrayValue>] extends [never] ? [] : ['array']),
  ...([Extract<Exclude<Value, ArrayValue>, ObjectValue>] extends [never]
    ? []
    : ['object']),
];

/** A multi-kind value belongs to one terminal schema, including its nullable flag. */
type UnionSchema<Value, Options extends Dictionary> = Omit<
  JSONSchema<Options>,
  'type'
> & {
  type: readonly [
    ...InferredKinds<Value>,
    ...(null extends Value ? ['null'] : []),
  ];
};

/**
 * Infers the appropriate Schema type based on the input value.
 * - For multiple non-null kinds, returns one union schema
 * - For nullable types (T | null), returns the corresponding Nullable schema
 * - For non-nullable types, returns the standard schema
 * - For pure null type, returns NullSchema
 */
export type InferJSONSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
> = unknown extends Value
  ? JSONSchema<Options>
  : InferredKinds<Exclude<Value, null>> extends readonly [
        unknown,
        unknown,
        ...unknown[],
      ]
    ? UnionSchema<Value, Options>
    : [Value] extends [null]
      ? NullSchema<Options>
      : IsNullable<Value> extends true
        ? InferNullableSchema<Exclude<Value, null>, Options>
        : InferNonNullableSchema<Value, Options>;

/** Binding presentation payload; core treats these fields as opaque data. */
export type SchemaPresentation = {
  /** Custom React component for input rendering */
  FieldInput?: ComponentType<FieldInputProps<any, any, any, any, any>> | null;
  /** Props passed to FieldInput component */
  FieldInputProps?: {
    /** Placeholder text for input fields */
    placeholder?: string;
    /** Display name aliases for enum values */
    alias?: Dictionary<ReactNode>;
    /** CSS class name for styling */
    className?: string;
    /** Inline CSS styles */
    style?: CSSProperties;
    /** Additional custom props */
    [alt: string]: any;
  };
  /** Props passed to FieldRenderer component */
  FieldRendererProps?: {
    /** Field label text or element */
    label?: ReactNode;
    /** CSS class name for styling */
    className?: string;
    /** Inline CSS styles */
    style?: CSSProperties;
    /** Additional custom props */
    [alt: string]: any;
  };
  /** Input type identifier for component selection */
  inputType?: string;
  /** Custom error messages per validation rule */
  errorMessages?: {
    [key: string]: string | Dictionary<string> | undefined;
    default?: string | Dictionary<string>;
  };
} & { [key: string]: unknown };

/** React binding of the renderer-independent core schema. */
export type JSONSchema<Options extends Dictionary = object> =
  import('../core/types/jsonSchema').JSONSchema<Options, SchemaPresentation>;

/** Recursive typed children shared by the per-kind schema aliases. */
type JSONSchemaChildren<Options extends Dictionary = object> =
  | NumberSchema<Options>
  | StringSchema<Options>
  | BooleanSchema<Options>
  | ArraySchema<Options>
  | ObjectSchema<Options>
  | NullSchema<Options>
  | RefSchema;

/** JSON Schema type union including virtual nodes */
export type JSONSchemaWithVirtual<Options extends Dictionary = object> =
  | NumberSchema<Options>
  | StringSchema<Options>
  | BooleanSchema<Options>
  | ArraySchema<Options>
  | ObjectSchema<Options>
  | NullSchema<Options>
  | VirtualSchema<Options>;

/** JSON Schema type union with virtual nodes and $ref support */
export type JSONSchemaWithRef<Options extends Dictionary = object> =
  | JSONSchemaWithVirtual<Options>
  | RefSchema;

/** Partial version of JSON Schema with virtual nodes */
export type PartialJSONSchema<Options extends Dictionary = object> = Partial<
  JSONSchemaWithVirtual<Options>
>;

/** Number type schema (numeric or integer values) */
export type NumberSchema<Options extends Dictionary = object> =
  | NonNullableNumberSchema<Options>
  | NullableNumberSchema<Options>;
/** Non-nullable number schema */
export type NonNullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNonNullableNumberSchema<Options, JSONSchemaChildren<Options>>;
/** Nullable number schema (type: ['number', 'null']) */
export type NullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNullableNumberSchema<Options, JSONSchemaChildren<Options>>;

/** String type schema */
export type StringSchema<Options extends Dictionary = object> =
  | NonNullableStringSchema<Options>
  | NullableStringSchema<Options>;
/** Non-nullable string schema with optional trim support */
export type NonNullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNonNullableStringSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Replace the stored value with its whitespace-trimmed form when the field emits `Blurred` (default: false) */
        trim?: boolean;
      };
    };
/** Nullable string schema (type: ['string', 'null']) with optional trim support */
export type NullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNullableStringSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Replace the stored value with its whitespace-trimmed form when the field emits `Blurred` (default: false) */
        trim?: boolean;
      };
    };

/** Boolean type schema */
export type BooleanSchema<Options extends Dictionary = object> =
  | NonNullableBooleanSchema<Options>
  | NullableBooleanSchema<Options>;
/** Non-nullable boolean schema */
export type NonNullableBooleanSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNonNullableBooleanSchema<Options, JSONSchemaChildren<Options>>;
/** Nullable boolean schema (type: ['boolean', 'null']) */
export type NullableBooleanSchema<Options extends Dictionary = object> =
  BasicSchema & BaseNullableBooleanSchema<Options, JSONSchemaChildren<Options>>;

/** Array type schema */
export type ArraySchema<Options extends Dictionary = object> =
  | NonNullableArraySchema<Options>
  | NullableArraySchema<Options>;
/** Non-nullable array schema */
export type NonNullableArraySchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNonNullableArraySchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Remove trailing `undefined` items from the array's normalized value (parent propagation, root validation, external emission); child nodes keep the raw array (default: false) */
        omitTrailing?: boolean;
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
      };
    };
/** Nullable array schema (type: ['array', 'null']) */
export type NullableArraySchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNullableArraySchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Remove trailing `undefined` items from the array's normalized value (parent propagation, root validation, external emission); child nodes keep the raw array (default: false) */
        omitTrailing?: boolean;
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
      };
    };

/** Object type schema */
export type ObjectSchema<Options extends Dictionary = object> =
  | NonNullableObjectSchema<Options>
  | NullableObjectSchema<Options>;
/** Non-nullable object schema */
export type NonNullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNonNullableObjectSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
      };
    };
/** Nullable object schema (type: ['object', 'null']) */
export type NullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    BaseNullableObjectSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
      };
    };

/** Virtual node schema for a field group declared in `options.virtual` */
export type VirtualSchema<Options extends Dictionary = object> = {
  type: 'virtual';
  /** Dependent field paths for reactivity */
  fields?: readonly string[];
  nullable?: never;
} & BasicSchema &
  BaseBasicSchema<VirtualNodeValue, Options, JSONSchemaChildren<Options>>;

/** Null type schema */
export type NullSchema<Options extends Dictionary = object> = BasicSchema &
  BaseNullSchema<Options, JSONSchemaChildren<Options>>;

/** Base schema properties for all types */
export type BasicSchema = {
  /** Renderer data belongs to the binding and stays typed in per-kind schemas. */
  presentation?: SchemaPresentation;
  /** Rules and policies that change value and shape over time; any other key is a blueprint error */
  controls?: SchemaControls<JSONSchemaWithVirtual>;
  /** Field options and configurations */
  options?: {
    /** Omit empty values from form data (default: true) */
    omitEmpty?: boolean;
    [alt: string]: any;
  };
  [alt: string]: any;
};
