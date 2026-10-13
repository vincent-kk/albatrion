import type { CSSProperties, ComponentType } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { ChildNodeComponent } from '@/schema-form/components/SchemaNode';
import type {
  InferSchemaNode,
  SchemaNode,
  SetValueOption,
} from '@/schema-form/core';

import type { FieldRendererProps } from './fieldRenderer';
import type {
  InferJSONSchema,
  JSONSchema,
  JSONSchemaWithVirtual,
} from './jsonSchema';
import type { AllowedValue } from './value';

/**
 * Props that FieldInput Input Component must satisfy
 *
 * - `Value`: Type of value assigned to FieldInput Component
 * - `Context`: Type of UserDefinedContext passed to Form
 * - `WatchValues`: Type of values subscribed according to watch property defined in JSONSchema
 * - `Schema`: JSONSchema type of schema node assigned to FieldInput Component
 * - `Node`: Type of schema node assigned to FieldInput Component
 */
export interface FieldInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends ReadonlyArray<any> = ReadonlyArray<any>,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchema
    : InferJSONSchema<Value>,
  Node extends SchemaNode = unknown extends Value
    ? SchemaNode
    : InferSchemaNode<Schema>,
> {
  /** JSONSchema of FieldInput Component */
  jsonSchema: Schema;
  /** ReadOnly state of FieldInput Component */
  readOnly: boolean;
  /** Disabled state of FieldInput Component */
  disabled: boolean;
  /** Whether the schema node assigned to FieldInput Component is required */
  required: boolean;
  /** Schema node assigned to FieldInput Component */
  node: Node;
  /** JSON Schema type of this field (e.g., 'string', 'number', 'object', 'array') */
  type: Node['type'];
  /** Authored accepted schema kind(s), including integer. */
  schemaType: Node['schemaType'];
  /** Whether the stored value mismatches the accepted kinds. */
  typeMismatch: Node['typeMismatch'];
  /** Name of schema node assigned to FieldInput Component */
  name: Node['name'];
  /** Path of schema node assigned to FieldInput Component */
  path: Node['path'];
  /** Whether this field accepts null as a valid value (derived from schema type array including 'null') */
  nullable: Node['nullable'];
  /** Errors of schema node assigned to FieldInput Component */
  errors: Node['errors'];
  /** Whether to show errors for this field */
  errorVisible: boolean;
  /** Values subscribed according to `computed.watch`(=`&watch`) property defined in JSONSchema */
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
  ChildNodeComponents: ChildNodeComponent[];
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
 * - `Schema`: JSONSchema type of schema node assigned to FieldInput Component
 * - `Context`: Type of UserDefinedContext passed to Form
 */
export type FieldInputPropsWithSchema<
  Value extends AllowedValue = any,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchemaWithVirtual
    : InferJSONSchema<Value>,
  Context extends Dictionary = object,
> = FieldInputProps<Value, Context, any[], Schema>;

/**
 * Props that FieldInputPropsWithSchema must satisfy
 *
 * - `Value`: Type of value assigned to FieldInput Component
 * - `Schema`: JSONSchema type of schema node assigned to FieldInput Component
 * - `Node`: Type of schema node assigned to FieldInput Component
 */
export type FieldInputPropsWithNode<
  Value extends AllowedValue = any,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchemaWithVirtual
    : InferJSONSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
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
  type: SchemaNodeType;
  schemaType: SchemaNode['schemaType'];
  typeMismatch: boolean;
  nullable: boolean;
  errors: readonly any[];
  errorVisible: boolean;
  watchValues: readonly any[];
  defaultValue: any;
  value: any;
  onChange: SetStateFnWithOptions<any>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildNodeComponents: ChildNodeComponent<any>[];
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  context: any;
  [alt: string]: any;
}

export type InferFieldInputProps<Value> = Value extends AllowedValue
  ? FieldInputProps<Value>
  : UnknownFieldInputProps;

export type ChildNodeComponentProps<Value extends AllowedValue = any> = {
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
  ChildNodeComponentProps,
  'onChange' | 'onFileAttach' | 'FieldRenderer'
>;

export type FieldInputTestFn = Fn<[hint: Hint], boolean>;

export type SchemaNodeType = SchemaNode['type'];

type OptionalString = string | undefined;

export type FieldInputTestObject = Partial<{
  /** SchemaNode['schemaType'] | Array<SchemaNode['schemaType']> */
  type: SchemaNodeType | SchemaNodeType[];
  /** Accepted schema kinds, including integer and union member arrays. */
  schemaType: SchemaNode['schemaType'] | SchemaNode['schemaType'][];
  /** SchemaNode['path'] | Array<SchemaNode['path']> */
  path: string | string[];
  /** SchemaNode['required'] */
  required: boolean;
  /** SchemaNode['nullable] */
  nullable: boolean;
  /** JSONSchema['format'] | Array<JSONSchema['format']> | undefined */
  format: OptionalString | OptionalString[];
  /** JSONSchema['inputType'] | Array<JSONSchema['inputType']> | undefined */
  inputType: OptionalString | OptionalString[];
}>;

export type Hint = {
  /** SchemaNode['schemaType'] */
  type: SchemaNodeType;
  /** Authored accepted schema kind(s). */
  schemaType: SchemaNode['schemaType'];
  /** Whether the stored value mismatches the accepted kinds. */
  typeMismatch: boolean;
  /** SchemaNode['path'] */
  path: string;
  /** SchemaNode['required'] */
  required: boolean;
  /** SchemaNode['nullable] */
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

export type AttachedFilesMap = Map<SchemaNode['path'], File[]>;
