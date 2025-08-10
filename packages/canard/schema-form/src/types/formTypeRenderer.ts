import type { ComponentType, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';

import type { JsonSchemaError } from './error';
import type { OverridableFormTypeInputProps } from './formTypeInput';

/** Props that FormTypeRenderer Component must satisfy */
export interface FormTypeRendererProps extends OverridableFormTypeInputProps {
  /** Whether the schema node assigned to FormTypeRenderer Component is the root node */
  isRoot: boolean;
  /** Depth of the schema node assigned to FormTypeRenderer Component */
  depth: number;
  /** JsonSchema of the schema node assigned to FormTypeRenderer Component */
  jsonSchema: SchemaNode['jsonSchema'];
  /** Schema node assigned to FormTypeRenderer Component */
  node: SchemaNode;
  /** Type of the schema node assigned to FormTypeRenderer Component */
  type: SchemaNode['type'];
  /** Path of the schema node assigned to FormTypeRenderer Component */
  path: SchemaNode['path'];
  /** Name of the schema node assigned to FormTypeRenderer Component */
  name: SchemaNode['name'];
  /** Value of the schema node assigned to FormTypeRenderer Component */
  value: SchemaNode['value'];
  /** Errors of the schema node assigned to FormTypeRenderer Component */
  errors: SchemaNode['errors'];
  /** Whether the schema node assigned to FormTypeRenderer Component is required */
  required: SchemaNode['required'];
  /** FromTypeInput component of the schema node assigned to FormTypeRenderer Component */
  Input: ComponentType<OverridableFormTypeInputProps>;
  /** Error message of the schema node assigned to FormTypeRenderer Component */
  errorMessage: ReactNode;
  /** Function to format error message of the schema node assigned to FormTypeRenderer Component */
  formatError: FormatError;
  /** User defined context of the schema node assigned to FormTypeRenderer Component */
  context: Dictionary;
  /** Additional props of the schema node assigned to FormTypeRenderer Component */
  [alt: string]: any;
}

export type FormatError = Fn<
  [error: JsonSchemaError, node: SchemaNode, context: Dictionary],
  ReactNode
>;
