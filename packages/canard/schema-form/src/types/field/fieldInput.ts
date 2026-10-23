import type { CSSProperties, ComponentType } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { ChildField } from '@/schema-form/components/FieldProxy';
import type {
  FieldNode,
  InferFieldNode,
  SetValueOption,
} from '@/schema-form/core';

import type { JSONSchema, JSONSchemaWithVirtual } from '../schema/jsonSchema';
import type { AllowedValue } from '../schema/value';
import type { FieldRendererProps } from './fieldRenderer';
import type { InferFieldInputSchema } from './inferFieldInputSchema';

/**
 * Props that FieldInput Input Component must satisfy
 *
 * - `Value`: Type of value assigned to FieldInput Component
 * - `Context`: Type of UserDefinedContext passed to Form
 * - `WatchValues`: Type of values subscribed according to watch property defined in JSONSchema
 * - `Schema`: JSONSchema type of field node assigned to FieldInput Component
 * - `Node`: Type of field node assigned to FieldInput Component
 */
export interface FieldInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends ReadonlyArray<any> = ReadonlyArray<any>,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchema
    : InferFieldInputSchema<Value>,
  Node extends FieldNode = unknown extends Value
    ? FieldNode
    : InferFieldNode<Schema>,
> {
  /** JSONSchema of FieldInput Component */
  jsonSchema: Schema;
  /** ReadOnly state of FieldInput Component */
  readOnly: boolean;
  /** Disabled state of FieldInput Component */
  disabled: boolean;
  /** Whether the field node assigned to FieldInput Component is required */
  required: boolean;
  /** Field node assigned to FieldInput Component */
  node: Node;
  /** JSON Schema type of this field (e.g., 'string', 'number', 'object', 'array') */
  type: Node['type'];
  /** Authored accepted schema kind(s), including integer. */
  schemaType: Node['schemaType'];
  /** Whether the stored value mismatches the accepted kinds. */
  misfit: Node['misfit'];
  /** Name of field node assigned to FieldInput Component */
  name: Node['name'];
  /** Path of field node assigned to FieldInput Component */
  path: Node['path'];
  /** Whether this field accepts null as a valid value (derived from schema type array including 'null') */
  nullable: Node['nullable'];
  /** Errors of field node assigned to FieldInput Component */
  errors: Node['errors'];
  /** Whether to show errors for this field */
  errorVisible: boolean;
  /** Values of the paths listed in the schema's `controls.watch`, in order */
  watchValues: WatchValues;
  /** Default value of FieldInput Component */
  defaultValue: Value | undefined;
  /** Current value; the input owns its draft. An empty field is undefined. */
  value: Value | undefined;
  /** Publish the input draft; clearing writes null when the schema is nullable (REACT-027, LANDING-150). */
  onChange: SetStateFnWithOptions<Value | undefined>;
  /** onFileAttach handler of FieldInput Component */
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  /** Child FieldInput Components of this FieldInput Component */
  ChildFields: ChildField[];
  /** Placeholder text for input fields */
  placeholder: string | undefined;
  /** CSS class name for styling */
  className: string | undefined;
  /** Style of FieldInput Component */
  style: CSSProperties | undefined;
  /** UserDefinedContext passed to Form */
  context: Context;
  /** Additional properties can be freely defined */
  [alt: string]: any;
}

/**
 * Props that FieldInputPropsWithSchema must satisfy
 *
 * - `Value`: Type of value assigned to FieldInput Component
 * - `Schema`: JSONSchema type of field node assigned to FieldInput Component
 * - `Context`: Type of UserDefinedContext passed to Form
 */
export type FieldInputPropsWithSchema<
  Value extends AllowedValue = any,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchemaWithVirtual
    : InferFieldInputSchema<Value>,
  Context extends Dictionary = object,
> = FieldInputProps<Value, Context, any[], Schema>;

/**
 * Props that FieldInputPropsWithSchema must satisfy
 *
 * - `Value`: Type of value assigned to FieldInput Component
 * - `Schema`: JSONSchema type of field node assigned to FieldInput Component
 * - `Node`: Type of field node assigned to FieldInput Component
 */
export type FieldInputPropsWithNode<
  Value extends AllowedValue = any,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchemaWithVirtual
    : InferFieldInputSchema<Value>,
  Node extends FieldNode = InferFieldNode<Schema>,
> = FieldInputProps<Value, Dictionary, any[], Schema, Node>;

/** FieldInputProps to use when type inference is not needed */
export interface UnknownFieldInputProps {
  jsonSchema: any;
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  node: any;
  name: string;
  path: string;
  type: FieldNodeType;
  schemaType: FieldNode['schemaType'];
  misfit: boolean;
  nullable: boolean;
  errors: readonly any[];
  errorVisible: boolean;
  watchValues: readonly any[];
  defaultValue: any;
  value: any;
  onChange: SetStateFnWithOptions<any>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildFields: ChildField<any>[];
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  context: any;
  [alt: string]: any;
}

export type InferFieldInputProps<Value> = Value extends AllowedValue
  ? FieldInputProps<Value>
  : UnknownFieldInputProps;

export type ChildFieldProps<Value extends AllowedValue = any> = {
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  defaultValue?: Value;
  value?: Value;
  onChange?: SetStateFnWithOptions<Value>;
  onFileAttach?: Fn<[file: File | File[] | undefined]>;
  FieldRenderer?: ComponentType<FieldRendererProps>;
  className?: string;
  style?: CSSProperties;
  [alt: string]: any;
};

export type OverridableFieldInputProps = Omit<
  ChildFieldProps,
  'onChange' | 'onFileAttach' | 'FieldRenderer'
>;

export type FieldInputTestFn = Fn<[hint: FieldInputHint], boolean>;

export type FieldNodeType = FieldNode['type'];

/** FieldInputHint fields a test object matches by one value or by any value in a list. */
type ListMatchedHintKey =
  | 'type'
  | 'schemaType'
  | 'path'
  | 'format'
  | 'inputType';

/** Object form of a FieldInput test: each field narrows the FieldInputHint it accepts; an omitted field matches anything. */
export type FieldInputTestObject = Partial<
  {
    [Key in ListMatchedHintKey]: FieldInputHint[Key] | FieldInputHint[Key][];
  } & Pick<FieldInputHint, 'required' | 'nullable'>
>;

export type FieldInputHint = {
  /** FieldNode['type'] */
  type: FieldNodeType;
  /** Authored accepted JSON type(s); undefined for a virtual node, which has no JSON type. */
  schemaType: FieldNode['schemaType'];
  /** Whether the stored value mismatches the accepted kinds. */
  misfit: boolean;
  /** FieldNode['path'] */
  path: string;
  /** FieldNode['required'] */
  required: boolean;
  /** FieldNode['nullable'] */
  nullable: boolean;
  /** JSONSchema */
  jsonSchema: JSONSchema | JSONSchemaWithVirtual;
  /** JSONSchema['format'] */
  format?: string;
  /** JSONSchema['inputType'] */
  inputType?: string;
};

export type FieldInputDefinition<T = unknown> = {
  test: FieldInputTestFn | FieldInputTestObject;
  Component: ComponentType<unknown extends T ? any : InferFieldInputProps<T>>;
};

export type FieldInputMap<T = unknown> = {
  [path: string]: ComponentType<
    unknown extends T ? any : InferFieldInputProps<T>
  >;
};

export type SetStateFnWithOptions<S = unknown> = Fn<
  [value: S | ((prevState: S) => S), options?: SetValueOption]
>;

export type AttachedFilesMap = Map<FieldNode['path'], File[]>;
