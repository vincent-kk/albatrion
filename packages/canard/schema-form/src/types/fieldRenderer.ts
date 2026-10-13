import type { ComponentType, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';

import type { JSONSchemaError } from './error';
import type { ChildNodeComponentProps } from './fieldInput';

/** Props that FieldRenderer Component must satisfy */
export interface FieldRendererProps extends ChildNodeComponentProps {
  /** Whether the schema node assigned to FieldRenderer Component is the root node */
  isRoot: boolean;
  /** Depth of the schema node assigned to FieldRenderer Component */
  depth: number;
  /** JSONSchema of the schema node assigned to FieldRenderer Component */
  jsonSchema: SchemaNode['jsonSchema'];
  /** Schema node assigned to FieldRenderer Component */
  node: SchemaNode;
  /** Type of the schema node assigned to FieldRenderer Component */
  type: SchemaNode['type'];
  /** Path of the schema node assigned to FieldRenderer Component */
  path: SchemaNode['path'];
  /** Name of the schema node assigned to FieldRenderer Component */
  name: SchemaNode['name'];
  /** Value of the schema node assigned to FieldRenderer Component */
  value: SchemaNode['value'];
  /** Errors of the schema node assigned to FieldRenderer Component */
  errors: SchemaNode['errors'];
  /** Whether the schema node assigned to FieldRenderer Component is required */
  required: SchemaNode['required'];
  /** FromTypeInput component of the schema node assigned to FieldRenderer Component */
  Input: ComponentType<ChildNodeComponentProps>;
  /** Whether to show errors for the schema node assigned to FieldRenderer Component */
  errorVisible: boolean;
  /** Error message of the schema node assigned to FieldRenderer Component */
  errorMessage: ReactNode;
  /** Function to format error message of the schema node assigned to FieldRenderer Component */
  formatError: FormatError;
  /** User defined context of the schema node assigned to FieldRenderer Component */
  context: Dictionary;
  /** Additional props of the schema node assigned to FieldRenderer Component */
  [alt: string]: any;
}

export type FormatError = Fn<
  [error: JSONSchemaError, node: SchemaNode, context: Dictionary],
  ReactNode
>;
