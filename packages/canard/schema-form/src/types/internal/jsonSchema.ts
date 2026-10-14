import type { CSSProperties, ComponentType, ReactNode } from 'react';

import type {
  RefSchema,
  BasicSchema as WingletBasicSchema,
  NonNullableArraySchema as WingletNonNullableArraySchema,
  NonNullableBooleanSchema as WingletNonNullableBooleanSchema,
  NonNullableNumberSchema as WingletNonNullableNumberSchema,
  NonNullableObjectSchema as WingletNonNullableObjectSchema,
  NonNullableStringSchema as WingletNonNullableStringSchema,
  NullSchema as WingletNullSchema,
  NullableArraySchema as WingletNullableArraySchema,
  NullableBooleanSchema as WingletNullableBooleanSchema,
  NullableNumberSchema as WingletNullableNumberSchema,
  NullableObjectSchema as WingletNullableObjectSchema,
  NullableStringSchema as WingletNullableStringSchema,
} from '@winglet/json-schema';

import type { Dictionary, IsNullable } from '@aileron/declare';

import type { SchemaControls } from '@/schema-form/core';

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

export type JSONSchemaType = Extract<JSONSchemaWithVirtual['type'], string>;

/** Schema inference for non-nullable values */
type InferNonNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? BaseNonNullableNumberSchema<Options>
  : Value extends StringValue
    ? BaseNonNullableStringSchema<Options>
    : Value extends BooleanValue
      ? BaseNonNullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? BaseNonNullableArraySchema<Options>
        : Value extends ObjectValue
          ? BaseNonNullableObjectSchema<Options>
          : Value extends VirtualNodeValue
            ? VirtualNodeSchema<Options>
            : JSONSchemaWithVirtual<Options>;

/** Schema inference for nullable values (a virtual node is never nullable) */
type InferNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? BaseNullableNumberSchema<Options>
  : Value extends StringValue
    ? BaseNullableStringSchema<Options>
    : Value extends BooleanValue
      ? BaseNullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? BaseNullableArraySchema<Options>
        : Value extends ObjectValue
          ? BaseNullableObjectSchema<Options>
          : BaseNullSchema<Options>;

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
 * - For pure null type, returns BaseNullSchema
 */
export type BaseInferJSONSchema<
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
      ? BaseNullSchema<Options>
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
  import('@/schema-form/core').AuthoredSchema<Options, SchemaPresentation>;

/** Recursive typed children shared by the per-kind schema aliases. */
type JSONSchemaChildren<Options extends Dictionary = object> =
  | BaseNumberSchema<Options>
  | BaseStringSchema<Options>
  | BaseBooleanSchema<Options>
  | BaseArraySchema<Options>
  | BaseObjectSchema<Options>
  | BaseNullSchema<Options>
  | RefSchema;

/** JSON Schema type union including virtual nodes */
export type JSONSchemaWithVirtual<Options extends Dictionary = object> =
  | BaseNumberSchema<Options>
  | BaseStringSchema<Options>
  | BaseBooleanSchema<Options>
  | BaseArraySchema<Options>
  | BaseObjectSchema<Options>
  | BaseNullSchema<Options>
  | VirtualNodeSchema<Options>;

/** JSON Schema type union with virtual nodes and $ref support */
export type JSONSchemaWithRef<Options extends Dictionary = object> =
  | JSONSchemaWithVirtual<Options>
  | RefSchema;

/** Partial version of JSON Schema with virtual nodes */
export type PartialJSONSchema<Options extends Dictionary = object> = Partial<
  JSONSchemaWithVirtual<Options>
>;

/** Number type schema (numeric or integer values) */
export type BaseNumberSchema<Options extends Dictionary = object> =
  | BaseNonNullableNumberSchema<Options>
  | BaseNullableNumberSchema<Options>;
/** Non-nullable number schema */
export type BaseNonNullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNonNullableNumberSchema<Options, JSONSchemaChildren<Options>>;
/** Nullable number schema (type: ['number', 'null']) */
export type BaseNullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNullableNumberSchema<Options, JSONSchemaChildren<Options>>;

/** String type schema */
export type BaseStringSchema<Options extends Dictionary = object> =
  | BaseNonNullableStringSchema<Options>
  | BaseNullableStringSchema<Options>;
/** Non-nullable string schema with optional trim support */
export type BaseNonNullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNonNullableStringSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Replace the stored value with its whitespace-trimmed form when the field emits `Blurred` (default: false) */
        trim?: boolean;
      };
    };
/** Nullable string schema (type: ['string', 'null']) with optional trim support */
export type BaseNullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNullableStringSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Replace the stored value with its whitespace-trimmed form when the field emits `Blurred` (default: false) */
        trim?: boolean;
      };
    };

/** Boolean type schema */
export type BaseBooleanSchema<Options extends Dictionary = object> =
  | BaseNonNullableBooleanSchema<Options>
  | BaseNullableBooleanSchema<Options>;
/** Non-nullable boolean schema */
export type BaseNonNullableBooleanSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNonNullableBooleanSchema<Options, JSONSchemaChildren<Options>>;
/** Nullable boolean schema (type: ['boolean', 'null']) */
export type BaseNullableBooleanSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNullableBooleanSchema<Options, JSONSchemaChildren<Options>>;

/** Array type schema */
export type BaseArraySchema<Options extends Dictionary = object> =
  | BaseNonNullableArraySchema<Options>
  | BaseNullableArraySchema<Options>;
/** Non-nullable array schema */
export type BaseNonNullableArraySchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNonNullableArraySchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Remove trailing `undefined` items from the array's normalized value (parent propagation, root validation, external emission); child nodes keep the raw array (default: false) */
        omitTrailing?: boolean;
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
      };
    };
/** Nullable array schema (type: ['array', 'null']) */
export type BaseNullableArraySchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNullableArraySchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Remove trailing `undefined` items from the array's normalized value (parent propagation, root validation, external emission); child nodes keep the raw array (default: false) */
        omitTrailing?: boolean;
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
      };
    };

/** Object type schema */
export type BaseObjectSchema<Options extends Dictionary = object> =
  | BaseNonNullableObjectSchema<Options>
  | BaseNullableObjectSchema<Options>;
/** Non-nullable object schema */
export type BaseNonNullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNonNullableObjectSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
        /** Key order of the emitted object value, ahead of declaration order; it does not change the on-screen order */
        propertyOrder?: readonly string[];
        /** Virtual field groups by name; each gathers sibling properties into one virtual node */
        virtual?: Record<string, VirtualFieldGroup>;
      };
    };
/** Nullable object schema (type: ['object', 'null']) */
export type BaseNullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNullableObjectSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
        /** Key order of the emitted object value, ahead of declaration order; it does not change the on-screen order */
        propertyOrder?: readonly string[];
        /** Virtual field groups by name; each gathers sibling properties into one virtual node */
        virtual?: Record<string, VirtualFieldGroup>;
      };
    };

/** One `options.virtual` entry: the grouped sibling property names plus the virtual node's own schema keys */
type VirtualFieldGroup = BasicSchema & {
  /** Names of the sibling properties the virtual node gathers */
  fields: readonly string[];
};

/** Schema of a virtual node built from an `options.virtual` entry; never authored directly */
type VirtualNodeSchema<Options extends Dictionary = object> = {
  type: 'virtual';
  /** Dependent field paths for reactivity */
  fields?: readonly string[];
  nullable?: never;
} & BasicSchema &
  WingletBasicSchema<VirtualNodeValue, Options, JSONSchemaChildren<Options>>;

/** Null type schema */
export type BaseNullSchema<Options extends Dictionary = object> = BasicSchema &
  WingletNullSchema<Options, JSONSchemaChildren<Options>>;

/** Base schema properties for all types */
export type BasicSchema = {
  /** Renderer data belongs to the binding and stays typed in per-kind schemas. */
  presentation?: SchemaPresentation;
  /** Rules and policies that change value and shape over time; any other key is a blueprint error */
  controls?: SchemaControls<JSONSchema>;
  /** Field options and configurations */
  options?: {
    /** Omit empty values from form data (default: true) */
    omitEmpty?: boolean;
    [alt: string]: any;
  };
  [alt: string]: any;
};
