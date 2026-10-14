import type { ComponentType, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';

import type { JSONSchemaError } from './error';
import type { ChildFieldProps } from './fieldInput';

/** Props that FieldRenderer Component must satisfy */
export interface FieldRendererProps extends ChildFieldProps {
  /** Whether the field node assigned to FieldRenderer Component is the root node */
  isRoot: boolean;
  /** Depth of the field node assigned to FieldRenderer Component */
  depth: number;
  /** JSONSchema of the field node assigned to FieldRenderer Component */
  jsonSchema: FieldNode['jsonSchema'];
  /** Field node assigned to FieldRenderer Component */
  node: FieldNode;
  /** Type of the field node assigned to FieldRenderer Component */
  type: FieldNode['type'];
  /** Path of the field node assigned to FieldRenderer Component */
  path: FieldNode['path'];
  /** Name of the field node assigned to FieldRenderer Component */
  name: FieldNode['name'];
  /** Value of the field node assigned to FieldRenderer Component */
  value: FieldNode['value'];
  /** Errors of the field node assigned to FieldRenderer Component */
  errors: FieldNode['errors'];
  /** Whether the field node assigned to FieldRenderer Component is required */
  required: FieldNode['required'];
  /** `FieldInput` component of the field node assigned to FieldRenderer Component */
  Input: ComponentType<ChildFieldProps>;
  /** Whether to show errors for the field node assigned to FieldRenderer Component */
  errorVisible: boolean;
  /** Error message of the field node assigned to FieldRenderer Component */
  errorMessage: ReactNode;
  /** Function to format error message of the field node assigned to FieldRenderer Component */
  formatError: FormatError;
  /** User defined context of the field node assigned to FieldRenderer Component */
  context: Dictionary;
  /** Additional props of the field node assigned to FieldRenderer Component */
  [alt: string]: any;
}

export type FormatError = Fn<
  [error: JSONSchemaError, node: FieldNode, context: Dictionary],
  ReactNode
>;
