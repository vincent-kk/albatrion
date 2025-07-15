import type { CSSProperties, ComponentType, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';

import type { JsonSchemaError } from './error';
import type { OverridableFormTypeInputProps } from './formTypeInput';

/** Props that FormType Renderer Component must satisfy */
export interface FormTypeRendererProps extends OverridableFormTypeInputProps {
  /** Whether the schema node assigned to FormType Renderer Component is the root node */
  isRoot: boolean;
  /** Depth of the schema node assigned to FormType Renderer Component */
  depth: number;
  /** JsonSchema of the schema node assigned to FormType Renderer Component */
  jsonSchema: SchemaNode['jsonSchema'];
  /** Schema node assigned to FormType Renderer Component */
  node: SchemaNode;
  /** Type of the schema node assigned to FormType Renderer Component */
  type: SchemaNode['type'];
  /** Path of the schema node assigned to FormType Renderer Component */
  path: SchemaNode['path'];
  /** Name of the schema node assigned to FormType Renderer Component */
  name: SchemaNode['name'];
  /** Value of the schema node assigned to FormType Renderer Component */
  value: SchemaNode['value'];
  /** Errors of the schema node assigned to FormType Renderer Component */
  errors: SchemaNode['errors'];
  /** Whether the schema node assigned to FormType Renderer Component is required */
  required: SchemaNode['required'];
  /** Input component of the schema node assigned to FormType Renderer Component */
  Input: ComponentType<OverridableFormTypeInputProps>;
  /** Error message of the schema node assigned to FormType Renderer Component */
  errorMessage: ReactNode;
  /** Function to format error message of the schema node assigned to FormType Renderer Component */
  formatError: FormatError;
  /** User defined context of the schema node assigned to FormType Renderer Component */
  context: Dictionary;
  /** Additional props of the schema node assigned to FormType Renderer Component */
  [alt: string]: any;
}

export type FormatError = Fn<
  [error: JsonSchemaError, node: SchemaNode, context: Dictionary],
  ReactNode
>;
