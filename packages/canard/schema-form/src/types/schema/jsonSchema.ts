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

import type { Dictionary, Nullable, Optional } from '@aileron/declare';

import type { SchemaControls } from '@/schema-form/core';

import type { FieldInputProps } from '../field/fieldInput';
import type { VirtualNodeValue } from './value';

/** Binding presentation payload; core treats these fields as opaque data. */
export type SchemaPresentation = {
  /** Custom React component for input rendering */
  FieldInput?: Nullable<
    ComponentType<FieldInputProps<any, any, any, any, any>>
  >;
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
    [key: string]: Optional<string | Dictionary<string>>;
    default?: string | Dictionary<string>;
  };
} & { [key: string]: unknown };

/** React binding of the renderer-independent core schema. */
export type JSONSchema<Options extends Dictionary = object> =
  import('@/schema-form/core').AuthoredSchema<Options, SchemaPresentation>;

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
  | VirtualNodeSchema<Options>;

/** Number type schema (numeric or integer values) */
export type NumberSchema<Options extends Dictionary = object> =
  | NonNullableNumberSchema<Options>
  | NullableNumberSchema<Options>;
/** Non-nullable number schema */
export type NonNullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNonNullableNumberSchema<Options, JSONSchemaChildren<Options>>;
/** Nullable number schema (type: ['number', 'null']) */
export type NullableNumberSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNullableNumberSchema<Options, JSONSchemaChildren<Options>>;

/** String type schema */
export type StringSchema<Options extends Dictionary = object> =
  | NonNullableStringSchema<Options>
  | NullableStringSchema<Options>;
/** Non-nullable string schema with optional trim support */
export type NonNullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNonNullableStringSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Replace the stored value with its whitespace-trimmed form when the field emits `Blurred` (default: false) */
        trim?: boolean;
      };
    };
/** Nullable string schema (type: ['string', 'null']) with optional trim support */
export type NullableStringSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNullableStringSchema<Options, JSONSchemaChildren<Options>> & {
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
    WingletNonNullableBooleanSchema<Options, JSONSchemaChildren<Options>>;
/** Nullable boolean schema (type: ['boolean', 'null']) */
export type NullableBooleanSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNullableBooleanSchema<Options, JSONSchemaChildren<Options>>;

/** Array type schema */
export type ArraySchema<Options extends Dictionary = object> =
  | NonNullableArraySchema<Options>
  | NullableArraySchema<Options>;
/** Non-nullable array schema */
export type NonNullableArraySchema<Options extends Dictionary = object> =
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
export type NullableArraySchema<Options extends Dictionary = object> =
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
export type ObjectSchema<Options extends Dictionary = object> =
  | NonNullableObjectSchema<Options>
  | NullableObjectSchema<Options>;
/** Non-nullable object schema */
export type NonNullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNonNullableObjectSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
        /** Key order of the emitted object value, ahead of declaration order; it does not change the on-screen order */
        propertyOrder?: readonly string[];
        /** Virtual field groups by name; each gathers sibling properties into one virtual node */
        virtual?: Dictionary<VirtualFieldGroup>;
      };
    };
/** Nullable object schema (type: ['object', 'null']) */
export type NullableObjectSchema<Options extends Dictionary = object> =
  BasicSchema &
    WingletNullableObjectSchema<Options, JSONSchemaChildren<Options>> & {
      options?: {
        /** Build the node as one input over the whole value (`true`) or as child nodes (`false`); overrides the renderer's choice (default: terminal when `presentation.FieldInput` is a component, branch otherwise) */
        terminal?: boolean;
        /** Key order of the emitted object value, ahead of declaration order; it does not change the on-screen order */
        propertyOrder?: readonly string[];
        /** Virtual field groups by name; each gathers sibling properties into one virtual node */
        virtual?: Dictionary<VirtualFieldGroup>;
      };
    };

/** One `options.virtual` entry: the grouped sibling property names plus the virtual node's own schema keys */
type VirtualFieldGroup = BasicSchema & {
  /** Names of the sibling properties the virtual node gathers */
  fields: readonly string[];
};

/** Schema of a virtual node built from an `options.virtual` entry; never authored directly */
export type VirtualNodeSchema<Options extends Dictionary = object> = {
  type: 'virtual';
  /** Dependent field paths for reactivity */
  fields?: readonly string[];
  nullable?: never;
} & BasicSchema &
  WingletBasicSchema<VirtualNodeValue, Options, JSONSchemaChildren<Options>>;

/** Null type schema */
export type NullSchema<Options extends Dictionary = object> = BasicSchema &
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
