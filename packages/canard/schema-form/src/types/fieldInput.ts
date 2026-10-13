import type { CSSProperties, ComponentType } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { ChildNodeComponent } from '@/schema-form/components/Field';
import type {
  FieldNode,
  InferFieldNode,
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
 * - `Schema`: JSONSchema type of field node assigned to FieldInput Component
 * - `Node`: Type of field node assigned to FieldInput Component
 */
export interface FieldInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends ReadonlyArray<any> = ReadonlyArray<any>,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchema
    : InferJSONSchema<Value>,
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
  typeMismatch: Node['typeMismatch'];
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
 * - `Schema`: JSONSchema type of field node assigned to FieldInput Component
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
 * - `Schema`: JSONSchema type of field node assigned to FieldInput Component
 * - `Node`: Type of field node assigned to FieldInput Component
 */
export type FieldInputPropsWithNode<
  Value extends AllowedValue = any,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchemaWithVirtual
    : InferJSONSchema<Value>,
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

export type FieldNodeType = FieldNode['type'];

type OptionalString = string | undefined;

export type FieldInputTestObject = Partial<{
  /** FieldNode['schemaType'] | Array<FieldNode['schemaType']> */
  type: FieldNodeType | FieldNodeType[];
  /** Accepted schema kinds, including integer and union member arrays. */
  schemaType: FieldNode['schemaType'] | FieldNode['schemaType'][];
  /** FieldNode['path'] | Array<FieldNode['path']> */
  path: string | string[];
  /** FieldNode['required'] */
  required: boolean;
  /** FieldNode['nullable] */
  nullable: boolean;
  /** JSONSchema['format'] | Array<JSONSchema['format']> | undefined */
  format: OptionalString | OptionalString[];
  /** JSONSchema['inputType'] | Array<JSONSchema['inputType']> | undefined */
  inputType: OptionalString | OptionalString[];
}>;

export type Hint = {
  /** FieldNode['schemaType'] */
  type: FieldNodeType;
  /** Authored accepted schema kind(s). */
  schemaType: FieldNode['schemaType'];
  /** Whether the stored value mismatches the accepted kinds. */
  typeMismatch: boolean;
  /** FieldNode['path'] */
  path: string;
  /** FieldNode['required'] */
  required: boolean;
  /** FieldNode['nullable] */
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
