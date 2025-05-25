import type { CSSProperties, ComponentType } from 'react';

import type { Dictionary, Fn, WithKey } from '@aileron/declare';

import type {
  InferSchemaNode,
  PublicSetValueOption,
  SchemaNode,
} from '@/schema-form/core';

import type { FormTypeRendererProps } from './formTypeRenderer';
import type { InferJsonSchema, JsonSchemaWithVirtual } from './jsonSchema';
import type { AllowedValue } from './value';

/**
 * Props that FormType Input Component must satisfy
 *
 * - `Value`: Type of value assigned to FormType Component
 * - `Context`: Type of UserDefinedContext passed to Form
 * - `WatchValues`: Type of values subscribed according to watch property defined in JsonSchema
 * - `Schema`: JsonSchema type of schema node assigned to FormType Component
 * - `Node`: Type of schema node assigned to FormType Component
 */
export interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  /** JsonSchema of FormType Component */
  jsonSchema: Schema;
  /** ReadOnly state of FormType Component */
  readOnly: boolean;
  /** Disabled state of FormType Component */
  disabled: boolean;
  /** Whether the schema node assigned to FormType Component is required */
  required: boolean;
  /** Schema node assigned to FormType Component */
  node: Node;
  /** Name of schema node assigned to FormType Component */
  name: Node['name'];
  /** Path of schema node assigned to FormType Component */
  path: Node['path'];
  /** Errors of schema node assigned to FormType Component */
  errors: Node['errors'];
  /** Values subscribed according to `computed.watch`(=`&watch`) property defined in JsonSchema */
  watchValues: WatchValues;
  /** Default value of FormType Component */
  defaultValue: Value | undefined;
  /** Current value of FormType Component */
  value: Value;
  /** onChange handler of FormType Component */
  onChange: SetStateFnWithOptions<Value>;
  /** Child FormType Components of this FormType Component */
  ChildNodeComponents: WithKey<ComponentType<ChildFormTypeInputProps>>[];
  /** Style of FormType Component */
  style: CSSProperties | undefined;
  /** UserDefinedContext passed to Form */
  context: Context;
  /** Additional properties can be freely defined */
  [alt: string]: any;
}

/**
 * Props that FormTypeInputPropsWithSchema must satisfy
 *
 * - `Value`: Type of value assigned to FormType Component
 * - `Schema`: JsonSchema type of schema node assigned to FormType Component
 * - `Context`: Type of UserDefinedContext passed to Form
 */
export type FormTypeInputPropsWithSchema<
  Value extends AllowedValue = any,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Context extends Dictionary = object,
> = FormTypeInputProps<Value, Context, any[], Schema>;

/**
 * Props that FormTypeInputPropsWithSchema must satisfy
 *
 * - `Value`: Type of value assigned to FormType Component
 * - `Schema`: JsonSchema type of schema node assigned to FormType Component
 * - `Node`: Type of schema node assigned to FormType Component
 */
export type FormTypeInputPropsWithNode<
  Value extends AllowedValue = any,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> = FormTypeInputProps<Value, Dictionary, any[], Schema, Node>;

/** FormTypeInputProps to use when type inference is not needed */
export interface UnknownFormTypeInputProps {
  jsonSchema: any;
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  node: any;
  name: string;
  path: string;
  errors: any[];
  watchValues: any[];
  defaultValue: any;
  value: any;
  onChange: SetStateFnWithOptions<any>;
  ChildNodeComponents: WithKey<ComponentType<any>>[];
  style: CSSProperties | undefined;
  context: any;
  [alt: string]: any;
}

export type InferFormTypeInputProps<Value> = Value extends AllowedValue
  ? FormTypeInputProps<Value>
  : UnknownFormTypeInputProps;

export interface OverridableFormTypeInputProps {
  name?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  context?: Dictionary;
  style?: CSSProperties;
  className?: string;
  [alt: string]: any;
}

export interface ChildFormTypeInputProps extends OverridableFormTypeInputProps {
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  [alt: string]: any;
}

export type FormTypeTestFn = Fn<[hint: Hint], boolean>;

type JsonSchemaType = JsonSchemaWithVirtual['type'];

export type FormTypeTestObject = Partial<{
  /** JsonSchema['type'] | Array<JsonSchema['type']> */
  type: JsonSchemaType | JsonSchemaType[];
  /** SchemaNode['path'] | Array<SchemaNode['path']> */
  path: string | string[];
  /** JsonSchema */
  jsonSchema: JsonSchemaWithVirtual;
  /** JsonSchema['format'] | Array<JsonSchema['format']> */
  format: string | string[];
  /** JsonSchema['formType'] | Array<JsonSchema['formType']> */
  formType: string | string[];
}>;

export type Hint = {
  /** JsonSchema['type'] */
  type: JsonSchemaType;
  /** SchemaNode['path'] */
  path: string;
  /** JsonSchema */
  jsonSchema: JsonSchemaWithVirtual;
  /** JsonSchema['format'] */
  format?: string;
  /** JsonSchema['formType'] */
  formType?: string;
};

export type FormTypeInputDefinition<T = unknown> = {
  test: FormTypeTestFn | FormTypeTestObject;
  Component: ComponentType<InferFormTypeInputProps<T>>;
};

export type FormTypeInputMap<T = unknown> = {
  [path: string]: ComponentType<InferFormTypeInputProps<T>>;
};

export type SetStateFnWithOptions<S = unknown> = (
  value: S | ((prevState: S) => S),
  options?: PublicSetValueOption,
) => void;
