import type { ComponentType, HTMLAttributes, ReactNode } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';

import type { JsonSchemaError } from './error';
import type { InferFormTypeInputProps } from './formTypeInput';

export interface SchemaNodeRendererProps {
  isArrayItem: boolean;
  isRoot: boolean;
  depth: number;
  jsonSchema: SchemaNode['jsonSchema'];
  node: SchemaNode;
  path: SchemaNode['path'];
  name: SchemaNode['name'];
  value: SchemaNode['value'];
  errors: SchemaNode['errors'];
  Input: ComponentType<OverrideFormTypeInputProps>;
  errorMessage: ReactNode;
  formatError: (error: JsonSchemaError) => ReactNode;
  context: Dictionary;
}

export type OverrideFormTypeInputProps<T = unknown> = Partial<
  InferFormTypeInputProps<T>
> &
  Pick<HTMLAttributes<unknown>, 'className'>;
