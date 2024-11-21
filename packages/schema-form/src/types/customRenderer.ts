import type { ComponentType, HTMLAttributes, ReactNode } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';

import type { JsonSchemaError } from './error';
import type { InferSchemaFormInputProps } from './schemaFormInput';

export interface CustomRendererProps {
  isArrayItem: boolean;
  isRoot: boolean;
  depth: number;
  jsonSchema: SchemaNode['jsonSchema'];
  node: SchemaNode;
  path: SchemaNode['path'];
  name: SchemaNode['name'];
  value: SchemaNode['value'];
  errors: SchemaNode['errors'];
  Input: ComponentType<OverrideSchemaFormInputProps>;
  errorMessage: ReactNode;
  formatError: (error: JsonSchemaError) => ReactNode;
  context: Dictionary;
}

export type OverrideSchemaFormInputProps<T = unknown> = Partial<
  InferSchemaFormInputProps<T>
> &
  Pick<HTMLAttributes<unknown>, 'className'>;
