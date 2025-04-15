import type { CSSProperties, ComponentType, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';

import type { JsonSchemaError } from './error';
import type { OverridableFormTypeInputProps } from './formTypeInput';

export interface FormTypeRendererProps {
  isArrayItem: boolean;
  isRoot: boolean;
  depth: number;
  jsonSchema: SchemaNode['jsonSchema'];
  node: SchemaNode;
  type: SchemaNode['type'];
  path: SchemaNode['path'];
  name: SchemaNode['name'];
  value: SchemaNode['value'];
  errors: SchemaNode['errors'];
  Input: ComponentType<OverridableFormTypeInputProps>;
  errorMessage: ReactNode;
  formatError: FormatError;
  context: Dictionary;
}

export type FormatError = Fn<
  [error: JsonSchemaError, options?: FormatErrorOptions],
  ReactNode
>;

export type FormatErrorOptions = {
  className?: string;
  style?: CSSProperties;
  context?: Dictionary;
  [alt: string]: any;
};
