import type { CSSProperties, ComponentType, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';

import type { JSONSchemaError } from '../error/error';
import type { ChildFieldProps } from './fieldInput';
import type {
  ErrorMessageRendererProps,
  LabelRendererProps,
} from './partRenderer';

/** Props that FieldRenderer Component must satisfy */
export interface FieldRendererProps {
  /** Change relays belong on Input, not on renderer props. */
  onChange?: never;
  /** Attachment relays belong on Input, not on renderer props. */
  onFileAttach?: never;
  /** Default values belong to the node binding, not to renderer props. */
  defaultValue?: never;
  /** Optional presentation lock passed by a layout. */
  readOnly?: boolean;
  /** Optional presentation disable state passed by a layout. */
  disabled?: boolean;
  /** Renderer presentation class. */
  className?: string;
  /** Renderer presentation styles. */
  style?: CSSProperties;
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
  /** Required indicator; display overrides do not change schema validation */
  required: FieldNode['isRequired'];
  /** `FieldInput` component of the field node assigned to FieldRenderer Component */
  Input: ComponentType<ChildFieldProps>;
  /** Bound registered label; omitted children use the field name. */
  Label: ComponentType<Partial<LabelRendererProps>>;
  /** Bound registered error root; the caller supplies its message. */
  ErrorMessage: ComponentType<Partial<ErrorMessageRendererProps>>;
  /** Whether to show errors for the field node assigned to FieldRenderer Component.
   * Newly eligible or interrupted errors wait for the next eligibility release; continuously eligible errors may lag. */
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
